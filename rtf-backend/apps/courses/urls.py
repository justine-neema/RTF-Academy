from django.urls import path
from .views import (
    AdminCourseCreateView,
    AdminCourseDetailView,
    AdminEnrollmentReportView,
    AdminStatsView,
    CourseDetailView,
    CourseListView,
    LessonDetailView,
)

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('admin/', AdminCourseCreateView.as_view(), name='admin-course-create'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-course-stats'),
    path('admin/enrollments/report/', AdminEnrollmentReportView.as_view(), name='admin-enrollment-report'),
    path('<uuid:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('lessons/<uuid:lesson_id>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('admin/<uuid:pk>/', AdminCourseDetailView.as_view(), name='admin-course-detail'),
]
