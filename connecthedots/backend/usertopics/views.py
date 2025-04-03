from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import UserTopics
from .serializers import UserTopicsSerializer
from rest_framework.permissions import IsAuthenticated

class UserTopicsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_topics = UserTopics.objects.filter(user=user).select_related('topic')
        serializer = UserTopicsSerializer(user_topics, many=True)
        return Response(serializer.data)
