from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Topic
from .serializers import TopicSerializer
from django.shortcuts import get_object_or_404
from usertopics.models import UserTopics
from usertopics.utils import record_user_topic_action

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        topic = serializer.save(createdBy=self.request.user)  
        record_user_topic_action(self.request.user, topic, 'created')

    def get_queryset(self):
        queryset = Topic.objects.all()
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(topicName__icontains=search_query)
        return queryset.order_by('-creationDate')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)