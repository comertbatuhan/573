from django.db import models
from django.conf import settings

# Create your models here.
class Graph(models.Model):
    graph_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='graphs'
    )

    def __str__(self):
        return self.graph_name

    class Meta:
        db_table = 'graphs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
        ]
