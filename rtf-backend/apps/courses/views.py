from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from progress.models import Enrollment
from .models import Course, Lesson, Module
from .serializers import CourseSerializer, LessonSerializer


class CourseListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        courses = Course.objects.filter(is_published=True).prefetch_related('modules__lessons').order_by('title')
        return Response(CourseSerializer(courses, many=True).data)


class CourseDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        course = get_object_or_404(
            Course.objects.filter(is_published=True).prefetch_related('modules__lessons'),
            pk=pk,
        )
        return Response(CourseSerializer(course).data)


class LessonDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson.objects.select_related('module__course'), pk=lesson_id)
        return Response(LessonSerializer(lesson).data)


class AdminCourseCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not getattr(request.user, 'role', None) == 'Admin':
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title')
        if not title:
            return Response({'detail': 'title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        course = Course.objects.create(
            title=title,
            description=request.data.get('description', ''),
            thumbnail_url=request.data.get('thumbnail_url'),
            outcomes=request.data.get('outcomes', []),
            is_published=request.data.get('is_published', True),
        )

        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)


class AdminCourseDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if not getattr(request.user, 'role', None) == 'Admin':
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        course = get_object_or_404(Course, pk=pk)
        for field in ['title', 'description', 'thumbnail_url', 'is_published']:
            if field in request.data:
                setattr(course, field, request.data[field])
        if 'outcomes' in request.data:
            course.outcomes = request.data['outcomes']
        course.save()
        return Response(CourseSerializer(course).data)

    def delete(self, request, pk):
        if not getattr(request.user, 'role', None) == 'Admin':
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        course = get_object_or_404(Course, pk=pk)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', None) != 'Admin':
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        total_courses = Course.objects.count()
        total_students = Enrollment.objects.values('student').distinct().count()
        total_enrollments = Enrollment.objects.count()

        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'total_enrollments': total_enrollments,
        })


class AdminEnrollmentReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', None) != 'Admin':
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        rows = list(
            Course.objects.annotate(
                enrollment_count=Count('enrollments'),
                completed_count=Count('enrollments', filter=Q(enrollments__is_completed=True)),
            ).values('id', 'title', 'enrollment_count', 'completed_count')
        )
        return Response(rows)
