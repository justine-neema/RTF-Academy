from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/progress/', include('apps.progress.urls')),
    path('api/assessments/', include('apps.quizzes.urls')),
    path('api/certificates/', include('apps.certificates.urls')),
]