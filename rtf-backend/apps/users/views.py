from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
import jwt

from .models import UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer

# ==========================================
# 1. STANDARD AUTH (EMAIL & PASSWORD)
# ==========================================

class RegisterView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class CustomLoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# ==========================================
# 2. GOOGLE OAUTH (MANUAL IMPLEMENTATION)
# ==========================================

class GoogleLogin(generics.CreateAPIView):
    """
    POST /api/users/auth/google/
    Manually decodes the Google token, creates the user, and returns JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get('access_token')
        if not token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the Google ID token
            decoded_token = jwt.decode(token, options={"verify_signature": False}, algorithms=["RS256"])
            email = decoded_token.get('email')
            full_name = decoded_token.get('name', email.split('@')[0] if email else 'Learner')

            if not email:
                return Response({"error": "No email found in token"}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create the user
            user, created = UserProfile.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': full_name,
                    'role': 'Student',
                    'is_active': True
                }
            )

            # If the user exists but has no full_name, update it
            if not created and not user.full_name:
                user.full_name = full_name
                user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)