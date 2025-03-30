from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'topic', 'user', 'content', 'creationDate']
        read_only_fields = ['creationDate'] 