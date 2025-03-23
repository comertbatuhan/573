from django.db import models
from nodes.models import Node
from django.conf import settings

# Create your models here.
class UserNode(models.Model):
    node = models.ForeignKey(
        'nodes.Node',
        on_delete=models.CASCADE,
        related_name='user_nodes'
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='user_nodes'
    )
    creationDate = models.DateTimeField(auto_now_add=True)


    class Meta:
        db_table = 'usernodes'
        ordering = ['-creationDate']
        indexes = [
            models.Index(fields=['creationDate']),
            models.Index(fields=['node']),
        ]
        
    def __str__(self):
        return f"UserNode for node {self.node.id} and user {self.user.id}"
