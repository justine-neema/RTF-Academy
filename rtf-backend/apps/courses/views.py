from django.db.models import Avg, Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.certificates.models import Certificate
from apps.progress.models import Enrollment, LessonCompletion, QuizAttempt
from apps.users.permissions import IsAdminRole
from apps.quizzes.models import Question, Quiz
from apps.users.models import UserProfile

from .utils import get_locked_modules
from .models import Course, Lesson, Module
from .serializers import (
    AdminCourseDetailSerializer, AdminLessonSerializer, AdminModuleSerializer,
    CourseCreateUpdateSerializer, CourseListSerializer, LessonWriteSerializer,
    ModuleWriteSerializer, StudentCourseDetailSerializer, StudentLessonSerializer,
    StudentModuleSerializer,
)

def _is_admin(user):
    return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'Admin')

# Optimized base queryset with Annotations
def _course_base_queryset():
    return Course.objects.prefetch_related(
        Prefetch('modules', queryset=Module.objects.prefetch_related('lessons').order_by('sequence_order'))
    ).annotate(
        module_count=Count('modules', distinct=True),
        total_lessons=Count('modules__lessons', distinct=True)
    )

# ==========================================
# STUDENT ROUTES
# ==========================================

class CourseListView(generics.ListAPIView):
    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Course.objects.filter(is_published=True).annotate(
            module_count=Count('modules', distinct=True),
            total_lessons=Count('modules__lessons', distinct=True)
        ).order_by('-created_at')

    # Cache this endpoint for 15 minutes (900 seconds)
    @method_decorator(cache_page(60 * 15))
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = StudentCourseDetailSerializer
    permission_classes = [AllowAny]
    queryset = _course_base_queryset().filter(is_published=True)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        request = context.get('request')
        
        try:
            course = self.get_object()
        except Exception:
            return context

        if request and request.user.is_authenticated:
            if Enrollment.objects.filter(student=request.user, course=course).exists():
                context['locked_modules'] = get_locked_modules(request.user, course)
                return context

        context['locked_modules'] = set(course.modules.values_list('id', flat=True))
        return context

class StudentLessonDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            lesson = Lesson.objects.select_related('module__course').get(pk=pk)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

        course = lesson.module.course
        student = request.user

        if not Enrollment.objects.filter(student=student, course=course).exists():
            return Response({'detail': 'You are not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)

        locked_modules = get_locked_modules(student, course)
        if lesson.module.id in locked_modules:
            return Response({'detail': 'This module is currently locked.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentLessonSerializer(lesson, context={'locked_modules': locked_modules})
        return Response(serializer.data)

# ==========================================
# ADMIN ROUTES
# ==========================================

class CourseModuleCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)
        serializer = ModuleWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        module = serializer.save(course=course)
        return Response(AdminModuleSerializer(module).data, status=status.HTTP_201_CREATED)

class ModuleDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def put(self, request, pk):
        module = get_object_or_404(Module, pk=pk)
        serializer = ModuleWriteSerializer(module, data=request.data)
        serializer.is_valid(raise_exception=True)
        module = serializer.save()
        return Response(AdminModuleSerializer(module).data)

    def delete(self, request, pk):
        module = get_object_or_404(Module, pk=pk)
        module.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ModuleLessonCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, module_id):
        module = get_object_or_404(Module, pk=module_id)
        serializer = LessonWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save(module=module)
        return Response(AdminLessonSerializer(lesson).data, status=status.HTTP_201_CREATED)

class AdminCourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = _course_base_queryset().order_by('-created_at')

    def get_serializer_class(self):
        return CourseCreateUpdateSerializer if self.request.method == 'POST' else CourseListSerializer

class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = _course_base_queryset()

    def get_serializer_class(self):
        return CourseCreateUpdateSerializer if self.request.method in ['PUT', 'PATCH'] else AdminCourseDetailSerializer

class AdminCoursePublishView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        course.is_published = True
        course.save(update_fields=['is_published', 'updated_at'])
        return Response(AdminCourseDetailSerializer(course, context={'request': request}).data)

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    # Cache Admin Stats for 5 minutes
    @method_decorator(cache_page(60 * 5))
    def get(self, request):
        return Response({
            'courses': {'total': Course.objects.count(), 'published': Course.objects.filter(is_published=True).count()},
            'content': {'modules': Module.objects.count(), 'lessons': Lesson.objects.count(), 'quizzes': Quiz.objects.count()},
            'learners': {'students': UserProfile.objects.filter(role='Student').count(), 'enrollments': Enrollment.objects.count()},
        })

class AdminEnrollmentReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        courses = Course.objects.annotate(
            enrollment_count=Count('enrollments', distinct=True),
            average_progress=Avg('enrollments__progress_percentage'),
        ).order_by('-enrollment_count')
        
        results = [{
            'course_id': c.id, 'title': c.title, 'enrollments': c.enrollment_count,
            'average_progress': round(c.average_progress or 0, 2)
        } for c in courses]
        return Response({'results': results})