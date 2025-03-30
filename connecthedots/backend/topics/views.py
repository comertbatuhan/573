from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Topic
from .serializers import TopicSerializer
from django.shortcuts import get_object_or_404

# Create your views here.

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(createdBy=self.request.user)

    def get_queryset(self):
        queryset = Topic.objects.all()
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(topicName__icontains=search_query)
        return queryset.order_by('-creationDate')
