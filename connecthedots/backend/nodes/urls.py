from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_nodes),
    path('create/', views.create_node),
    path('<int:pk>/', views.update_or_delete_node),
]
