from rest_framework import serializers
from .models import Node

class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = ['id', 'manual_name', 'qid', 'description', 'creation_date', 'created_by_user', 'topic']
        read_only_fields = ['created_by_user']
