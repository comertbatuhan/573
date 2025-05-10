from rest_framework import serializers
from .models import UserTopics
from topics.models import Topic

class UserTopicsSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.topicName', read_only=True)
    topic_id = serializers.IntegerField(source='topic.id', read_only=True)

    class Meta:
        model = UserTopics
        fields = ['topic_id', 'topic_name', 'posted', 'created', 'addedNode', 'actionDate'] 