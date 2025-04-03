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
    path('api/usertopics/', include('usertopics.urls')),
]
