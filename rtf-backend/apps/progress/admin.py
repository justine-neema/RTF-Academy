from django.contrib import admin
from apps.courses.models import Lesson
from .models import Enrollment, LessonCompletion, QuizAttempt

admin.site.register(Enrollment)
admin.site.register(LessonCompletion)
admin.site.register(QuizAttempt)