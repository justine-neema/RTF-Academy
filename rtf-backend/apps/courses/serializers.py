from rest_framework import serializers
from .models import Course, Module, Lesson
from apps.progress.models import Enrollment
from .utils import calculate_progress

# ==========================================
# STUDENT SERIALIZERS
# ==========================================

class StudentLessonSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'text_content', 'video_s3_url', 'sequence_order', 'estimated_minutes', 'is_locked']

    def get_is_locked(self, obj):
        locked_modules = self.context.get('locked_modules', set())
        return obj.module_id in locked_modules

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('is_locked'):
            data['text_content'] = None
            data['video_s3_url'] = None
        return data


class StudentModuleSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    lessons = serializers.SerializerMethodField()
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True) # Optimized

    class Meta:
        model = Module
        fields = ['id', 'title', 'sequence_order', 'is_locked', 'lesson_count', 'lessons']

    def get_is_locked(self, obj):
        locked_modules = self.context.get('locked_modules', set())
        return obj.id in locked_modules

    def get_lessons(self, obj):
        locked_modules = self.context.get('locked_modules', set())
        lessons = obj.lessons.all() # Already prefetched in view
        return StudentLessonSerializer(
            lessons, many=True, context={'locked_modules': locked_modules}
        ).data


class StudentCourseDetailSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    total_lessons = serializers.IntegerField(read_only=True) # Optimized
    module_count = serializers.IntegerField(read_only=True) # Optimized
    is_enrolled = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'outcomes', 'thumbnail_url',
            'modules', 'total_lessons', 'module_count',
            'is_enrolled', 'progress_percentage'
        ]

    def get_modules(self, obj):
        return StudentModuleSerializer(
            obj.modules.all(), # Already prefetched in view
            many=True,
            context=self.context
        ).data

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        # Using .exists() is fast and prevents fetching full objects
        return Enrollment.objects.filter(student=request.user, course=obj).exists()

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        if not Enrollment.objects.filter(student=request.user, course=obj).exists():
            return 0
        return calculate_progress(request.user, obj)


class CourseListSerializer(serializers.ModelSerializer):
    total_lessons = serializers.IntegerField(read_only=True) # Optimized
    module_count = serializers.IntegerField(read_only=True) # Optimized

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail_url', 'is_published',
            'created_at', 'updated_at', 'total_lessons', 'module_count',
        ]


# ==========================================
# ADMIN SERIALIZERS
# ==========================================

class AdminLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'text_content', 'video_s3_url', 'sequence_order', 'estimated_minutes']


class AdminModuleSerializer(serializers.ModelSerializer):
    lessons = AdminLessonSerializer(many=True, read_only=True)
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'sequence_order', 'lessons', 'lesson_count']


class AdminCourseDetailSerializer(serializers.ModelSerializer):
    modules = AdminModuleSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)
    module_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail_url', 'is_published', 
            'created_at', 'updated_at', 'modules', 'total_lessons', 'module_count'
        ]


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail_url', 'is_published']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ModuleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title', 'sequence_order']
        read_only_fields = ['id']


class LessonWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'text_content', 'video_s3_url', 'sequence_order', 'estimated_minutes']
        read_only_fields = ['id']