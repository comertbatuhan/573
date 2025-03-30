from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth import get_user_model, authenticate, login
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Create your views here.

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        serializer = UserSerializer(user)
        return Response({
            'token': str(refresh.access_token),
            'user': serializer.data
        })
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['POST'])
def password_reset_request(request):
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Please provide an email address'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        
        reset_url = f"http://localhost:3000/reset-password/{token}"
        
        return Response({
            'message': 'Password reset email sent',
            'reset_url': reset_url  
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User with this email does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'})

    @action(detail=False, methods=['delete'])
    def delete_profile(self, request):
        user = request.user
        # Instead of deleting the user, we'll anonymize their data
        with transaction.atomic():
            # Update user data to be anonymous
            user.username = f"deleted_user_{user.id}"
            user.email = f"deleted_{user.id}@example.com"
            user.first_name = "Deleted"
            user.last_name = "User"
            user.set_password(User.objects.make_random_password())
            user.is_active = False
            user.save()

            # Keep all user-related data (topics, posts, etc.)
            # They will be associated with the anonymized user

        return Response({'message': 'Profile deleted successfully'})
