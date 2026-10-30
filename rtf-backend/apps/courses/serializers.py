from rest_framework import serializers
from .models import Course, Module, Lesson


class CourseListSerializer(serializers.ModelSerializer):
    module_count = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'thumbnail_url', 'description', 'module_count', 'total_lessons', 'is_published']

    def get_module_count(self, obj):
        return obj.modules.count()

    def get_total_lessons(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'content', 'video_url', 'duration_minutes',
            'sequence_order', 'is_preview', 'module_id'
        ]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'sequence_order', 'lessons']


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    module_count = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail_url', 'outcomes',
            'is_published', 'module_count', 'total_lessons', 'modules',
            'created_at', 'updated_at'
        ]

    def get_module_count(self, obj):
        return obj.modules.count()

    def get_total_lessons(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())
