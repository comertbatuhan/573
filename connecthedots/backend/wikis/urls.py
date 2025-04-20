from django.urls import path
from .views import search_wikidata

urlpatterns = [
    path('search/', search_wikidata),
]
