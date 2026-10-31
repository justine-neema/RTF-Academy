from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'full_name', 'role', 'created_at', 'is_active', 'is_admin']
        read_only_fields = ['id', 'email', 'role', 'created_at', 'is_active', 'is_admin']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    full_name = serializers.CharField(required=True)

    class Meta:
        model = UserProfile
        fields = ['email', 'full_name', 'password']

    def create(self, validated_data):
        user = UserProfile.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user
    
    def to_representation(self, instance):
        return UserProfileSerializer(instance).data