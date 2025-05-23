from django.db import models
from django.conf import settings

class Node(models.Model):
    manual_name = models.CharField(max_length=255, null=True, blank=True)
    qid = models.ForeignKey(
        'wikis.Wiki',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nodes'
    )
    creation_date = models.DateTimeField(auto_now_add=True)
    topic = models.ForeignKey(
        'topics.Topic',
        on_delete=models.CASCADE,
        related_name='nodes'
    )
    created_by_user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='created_nodes'
    )
    description = models.TextField(blank=True, null=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)

    class Meta:
        db_table = 'nodes'
        indexes = [
            models.Index(fields=['created_by_user']),
            models.Index(fields=['qid']),
        ]

    def __str__(self):
        display_name = self.manual_name if self.manual_name else f"Node {self.id}"
        return display_name
