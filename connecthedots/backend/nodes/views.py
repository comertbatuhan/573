from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Node
from .serializers import NodeSerializer
from wikis.models import Wiki
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])
def list_nodes(request):
    nodes = Node.objects.all()
    serializer = NodeSerializer(nodes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_node(request):
    data = request.data.copy()
    qid = data.get('qid')
    
    if qid:
        wiki, _ = Wiki.objects.get_or_create(qid=qid)
        data['qid'] = wiki.id
    else:
        data['qid'] = None

    topic_ids = data.pop('topic_ids', [])

    serializer = NodeSerializer(data=data)
    if serializer.is_valid():
        node = serializer.save(created_by_user=request.user)
        if topic_ids:
            node.topics.set(topic_ids)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
@api_view(['PUT', 'DELETE'])
def update_or_delete_node(request, pk):
    try:
        node = Node.objects.get(pk=pk)
    except Node.DoesNotExist:
        return Response({"error": "Node not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = NodeSerializer(node, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        node.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
