from django.db.models import Count

from progress.models import LessonCompletion
from .models import Course, Lesson, Module


def calculate_progress(student, course):
    total_lessons = Lesson.objects.filter(module__course=course).count()
    if total_lessons == 0:
        return 100

    completed = LessonCompletion.objects.filter(
        student=student,
        lesson__module__course=course,
    ).count()

    return int(round((completed / total_lessons) * 100))


def is_course_complete(student, course):
    total_lessons = Lesson.objects.filter(module__course=course).count()
    if total_lessons == 0:
        return True

    completed = LessonCompletion.objects.filter(
        student=student,
        lesson__module__course=course,
    ).count()

    return completed >= total_lessons


def get_locked_modules(student, course):
    """Return a simple empty list so the app stays permissive while still exposing progress APIs."""
    return []
