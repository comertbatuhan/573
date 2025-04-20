from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Connection
from .serializers import ConnectionSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])
def list_connections(request):
    connections = Connection.objects.all()
    serializer = ConnectionSerializer(connections, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_connection(request):
    serializer = ConnectionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(createdBy=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
def update_or_delete_connection(request, pk):
    try:
        connection = Connection.objects.get(pk=pk)
    except Connection.DoesNotExist:
        return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = ConnectionSerializer(connection, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        connection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
