from django.db import models
from django.conf import settings

class Connection(models.Model):
    id = models.AutoField(primary_key=True)
    DIRECTION_CHOICES = [
        ('UNDIRECTED', 'Undirected'),
        ('FIRST_TO_SECOND', 'First to Second'),
        ('SECOND_TO_FIRST', 'Second to First'),
    ]

    firstNodeID = models.ForeignKey('nodes.Node', on_delete=models.CASCADE, related_name='first_node_connections')
    secondNodeID = models.ForeignKey('nodes.Node', on_delete=models.CASCADE, related_name='second_node_connections')
    relationName = models.CharField(max_length=255)
    relationDirection = models.CharField(
        max_length=20,
        choices=DIRECTION_CHOICES,
        default='UNDIRECTED'
    )
    creationDate = models.DateTimeField(auto_now_add=True)
    createdBy = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='created_connections'
    )

    topic = models.ForeignKey(
        'topics.Topic',
        on_delete=models.CASCADE,
        related_name='connections'
    )


    class Meta:
        db_table = 'connections'
        indexes = [
            models.Index(fields=['createdBy']),
        ]

    def __str__(self):
        return f"Connection {self.id}: {self.firstNodeID} {self.relationName} {self.secondNodeID} ({self.relationDirection})"
