from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User

class UserTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.client = Client()
        self.register_url = reverse('register_user')
        self.login_url = reverse('login_user')
        self.password_reset_url = reverse('password_reset_request')

    def test_user_registration(self):
        """Test user registration with valid data"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)  # Including the one from setUp
        self.assertEqual(User.objects.get(username='newuser').email, 'new@example.com')

    def test_user_registration_invalid_data(self):
        """Test user registration with invalid data"""
        data = {
            'username': '',  # Empty username
            'email': 'invalid-email',
            'password': '123'  # Too short password
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful user login"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_reset_request(self):
        """Test password reset request"""
        data = {'email': 'test@example.com'}
        response = self.client.post(self.password_reset_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_password_reset_request_invalid_email(self):
        """Test password reset request with invalid email"""
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.password_reset_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_model_str(self):
        """Test the string representation of the User model"""
        self.assertEqual(str(self.user), f"{self.user.first_name} {self.user.last_name}")

    def test_user_email_unique(self):
        """Test that email addresses are unique"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='testuser2',
                email='test@example.com',  # Same email as existing user
                password='testpass123'
            )
