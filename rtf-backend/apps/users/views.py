from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# OAuth imports
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

from .models import UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer

# ==========================================
# 1. STANDARD AUTH (EMAIL & PASSWORD)
# ==========================================

class RegisterView(generics.CreateAPIView):
    """POST /api/users/register/ - Creates a new user with email and password."""
    queryset = UserProfile.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class CustomLoginView(TokenObtainPairView):
    """
    POST /api/users/login/ - Standard email & password login.
    Returns Access and Refresh JWT tokens.
    (Uses the default TokenObtainPairSerializer from SimpleJWT)
    """
    permission_classes = [permissions.AllowAny]

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/users/me/ - Fetches or updates the logged-in user's profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# ==========================================
# 2. GOOGLE OAUTH
# ==========================================

class GoogleLogin(SocialLoginView):
    """
    POST /api/users/auth/google/ - Receives Google access_token from React.
    Returns Access and Refresh JWT tokens.
    """
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173"
    client_class = OAuth2Client