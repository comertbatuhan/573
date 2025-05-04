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
    topic_id = request.query_params.get('topic_id')
    if topic_id:
        nodes = Node.objects.filter(topic_id=topic_id)
    else:
        nodes = Node.objects.all()
    serializer = NodeSerializer(nodes, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_node(request):
    data = request.data.copy()

    qid = data.get('qid')
    if qid:
        wiki, _ = Wiki.objects.get_or_create(qID=qid, defaults={"label": "", "description": ""})
        data['qid'] = wiki.qID  
    else:
        data.pop('qid', None) 


    topic_id = data.pop('topic_id', None)
    if not topic_id:
        return Response({'error': 'topic_id is required'}, status=400)

    data['topic'] = topic_id

    serializer = NodeSerializer(data=data)
    if serializer.is_valid():
        node = serializer.save(created_by_user=request.user)
        return Response(NodeSerializer(node).data, status=201)
    return Response(serializer.errors, status=400)


    
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
