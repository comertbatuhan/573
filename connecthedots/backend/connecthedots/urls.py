"""
URL configuration for connecthedots project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from nodes.views import create_node, update_or_delete_node
from connections.views import create_connection, update_or_delete_connection

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/", include("topics.urls")),
    
    path('api/nodes/', create_node, name='create_node'),
    path('api/nodes/<int:pk>/', update_or_delete_node, name='update_or_delete_node'),
    
    path('api/connections/', create_connection, name='create_connection'),
    path('api/connections/<int:pk>/', update_or_delete_connection, name='update_or_delete_connection'),
]
