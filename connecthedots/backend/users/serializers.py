from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'profile_image')
        read_only_fields = ('id',)
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.profile_image:
            representation['profile_image'] = instance.profile_image.url
        return representation

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user 