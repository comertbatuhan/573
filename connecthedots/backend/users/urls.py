from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, register_user, login_user, password_reset_request

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('password-reset/', password_reset_request, name='password_reset_request'),
    path('me/', UserViewSet.as_view({'get': 'get_me'}), name='get_me'),
    path('delete_profile/', UserViewSet.as_view({'delete': 'delete_profile'}), name='delete_profile'),
    path('update-profile/', UserViewSet.as_view({'put': 'update_profile'}), name='update_profile'),
    path('change-password/', UserViewSet.as_view({'post': 'change_password'}), name='change_password'),
] 