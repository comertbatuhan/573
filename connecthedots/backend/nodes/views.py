from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Node
from .serializers import NodeSerializer

@api_view(['POST'])
def create_node(request):
    serializer = NodeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by_user=request.user)  # or handle anonymous users
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
