from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'topic', 'user', 'username', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
