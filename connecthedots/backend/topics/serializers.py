from rest_framework import serializers
from .models import Topic

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'topicName', 'createdBy', 'creationDate']
        read_only_fields = ['createdBy', 'creationDate'] 