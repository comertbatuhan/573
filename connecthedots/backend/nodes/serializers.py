from rest_framework import serializers
from .models import Node
from wikis.models import Wiki

class WikiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wiki
        fields = '__all__'

class NodeSerializer(serializers.ModelSerializer):
    qid = WikiSerializer(required=False)

    class Meta:
        model = Node
        fields = '__all__'
