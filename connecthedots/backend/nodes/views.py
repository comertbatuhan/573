from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Node
from .serializers import NodeSerializer
from wikis.models import Wiki
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework import viewsets
from rest_framework.decorators import action
from usertopics.utils import record_user_topic_action
from topics.models import Topic

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
        # Record the interaction
        topic = Topic.objects.get(id=topic_id)
        record_user_topic_action(request.user, topic, 'addedNode')
        return Response(NodeSerializer(node).data, status=201)
    return Response(serializer.errors, status=400)


    
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_or_delete_node(request, pk):
    try:
        node = Node.objects.get(pk=pk)
    except Node.DoesNotExist:
        return Response({"error": "Node not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        data = request.data.copy()
        
        qid = data.get('qid')
        if qid:
            wiki, _ = Wiki.objects.get_or_create(qID=qid, defaults={"label": "", "description": ""})
            data['qid'] = wiki.qID
        else:
            data.pop('qid', None)
            
        serializer = NodeSerializer(node, data=data)
        if serializer.is_valid():
            serializer.save()
            # Record the interaction for editing
            record_user_topic_action(request.user, node.topic, 'addedNode')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Record the interaction before deleting
        record_user_topic_action(request.user, node.topic, 'addedNode')
        node.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Node.objects.all()
        topic_id = self.request.query_params.get('topic_id', None)
        if topic_id is not None:
            queryset = queryset.filter(topic_id=topic_id)
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        qid = data.get('qid')
        if qid:
            wiki, _ = Wiki.objects.get_or_create(qID=qid, defaults={"label": "", "description": ""})
            data['qid'] = wiki.qID
        else:
            data.pop('qid', None)

        topic = data.get('topic')
        if not topic:
            return Response({'error': 'topic is required'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            node = serializer.save(created_by_user=request.user)
            # Record the interaction
            topic_obj = Topic.objects.get(id=topic)
            record_user_topic_action(request.user, topic_obj, 'addedNode')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        qid = data.get('qid')
        if qid:
            wiki, _ = Wiki.objects.get_or_create(qID=qid, defaults={"label": "", "description": ""})
            data['qid'] = wiki.qID
        else:
            data.pop('qid', None)

        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Record the interaction for editing
            record_user_topic_action(request.user, instance.topic, 'addedNode')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Record the interaction before deleting
        record_user_topic_action(request.user, instance.topic, 'addedNode')
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def update_positions(self, request):
        try:
            positions = request.data.get('positions', [])
            for pos in positions:
                node = Node.objects.get(id=pos['id'])
                node.position_x = pos['position_x']
                node.position_y = pos['position_y']
                node.save()
            return Response({'status': 'positions updated'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
