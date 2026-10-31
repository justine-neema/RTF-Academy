from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # All user auth (login, register, google, profile) is handled here
    path('api/users/', include('apps.users.urls')),
    
    # Other apps
    path('api/courses/', include('apps.courses.urls')),
    path('api/progress/', include('apps.progress.urls')),
    path('api/assessments/', include('apps.quizzes.urls')),
    path('api/certificates/', include('apps.certificates.urls')),
]