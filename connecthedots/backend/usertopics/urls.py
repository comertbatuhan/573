from django.urls import path
from .views import UserTopicsAPIView

urlpatterns = [
    path('user-topics/', UserTopicsAPIView.as_view(), name='user-topics'),
] 