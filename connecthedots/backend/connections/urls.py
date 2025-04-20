from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_connections),
    path('create/', views.create_connection),
    path('<int:pk>/', views.update_or_delete_connection),
]
