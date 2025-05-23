from rest_framework import serializers
from .models import Topic

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'topicName', 'description', 'createdBy', 'creationDate', 'interactionCount']
        read_only_fields = ['createdBy', 'creationDate'] 