from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/", include("topics.urls")),
    path('api/forums/', include('forums.urls')),
    path('api/nodes/', include('nodes.urls')),
    path('api/connections/', include('connections.urls')),
    path('api/wikis/', include('wikis.urls')),
    path('api/usertopics/', include('usertopics.urls')),
]
