from rest_framework import viewsets, permissions
from .models import Post
from .serializers import PostSerializer
from usertopics.models import UserTopics
from usertopics.utils import record_user_topic_action

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        topic_id = self.request.query_params.get('topic')
        if topic_id:
            return Post.objects.filter(topic_id=topic_id).order_by('-created_at')
        return Post.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        topic = post.topic
        record_user_topic_action(self.request.user, topic, 'posted')