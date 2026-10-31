from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomLoginView, CurrentUserView, GoogleLogin

urlpatterns = [
    # Standard Email/Password Routes
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Google OAuth Route
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # Profile Route
    path('me/', CurrentUserView.as_view(), name='current-user'),
]