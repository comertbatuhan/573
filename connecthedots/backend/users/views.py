from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth import get_user_model, authenticate, login
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

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
        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
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
        
        # In a real application, you would send this via email
        # For development, we'll just return it in the response
        reset_url = f"http://localhost:3000/reset-password/{token}"
        
        return Response({
            'message': 'Password reset email sent',
            'reset_url': reset_url  # In production, remove this
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User with this email does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )
