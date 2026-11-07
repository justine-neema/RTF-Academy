from apps.progress.models import LessonCompletion, QuizAttempt
from apps.courses.models import Lesson, Module

def get_locked_modules(student, course):
    """
    Returns a set of module IDs that are locked for a student in a course.
    OPTIMIZED: Fetches all progress data in 2 queries instead of O(N) queries.
    """
    modules = list(course.modules.prefetch_related('lessons', 'quiz').order_by('sequence_order'))
    locked_modules = set()

    # 1. Fetch ALL completed lessons for this student in this course (1 query)
    completed_lesson_ids = set(
        LessonCompletion.objects.filter(
            student=student, lesson__module__course=course
        ).values_list('lesson_id', flat=True)
    )

    # 2. Fetch ALL passed quizzes for this student in this course (1 query)
    passed_quiz_ids = set(
        QuizAttempt.objects.filter(
            student=student, quiz__module__course=course, passed=True
        ).values_list('quiz_id', flat=True)
    )

    for i, module in enumerate(modules):
        if i == 0:
            continue  # Module 1 is always unlocked

        prev_module = modules[i - 1]

        # Check if all lessons in the previous module are completed
        prev_lesson_ids = set(l.id for l in prev_module.lessons.all())
        if len(prev_lesson_ids) == 0:
            all_lessons_done = True
        else:
            all_lessons_done = prev_lesson_ids.issubset(completed_lesson_ids)

        # Check if the quiz in the previous module is passed (if it has a quiz)
        quiz_passed = True
        if hasattr(prev_module, 'quiz') and prev_module.quiz:
            quiz_passed = prev_module.quiz.id in passed_quiz_ids

        # If either lessons or quiz are incomplete, lock this module and all subsequent ones
        if not (all_lessons_done and quiz_passed):
            for j in range(i, len(modules)):
                locked_modules.add(modules[j].id)
            break

    return locked_modules


def calculate_progress(student, course):
    """
    Progress = (completed_lessons + passed_quizzes) / (total_lessons + total_quizzes) * 100
    OPTIMIZED: Uses database counts instead of Python loops.
    """
    total_lessons = Lesson.objects.filter(module__course=course).count()
    completed_lessons = LessonCompletion.objects.filter(
        student=student, lesson__module__course=course
    ).count()

    modules_with_quiz = Module.objects.filter(course=course, quiz__isnull=False)
    total_quizzes = modules_with_quiz.count()
    
    # Efficient distinct count
    passed_quizzes = QuizAttempt.objects.filter(
        student=student, quiz__module__course=course, passed=True
    ).values('quiz_id').distinct().count()

    total = total_lessons + total_quizzes
    if total == 0:
        return 0

    return int((completed_lessons + passed_quizzes) / total * 100)


def is_course_complete(student, course):
    return calculate_progress(student, course) == 100