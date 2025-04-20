from django.db import models
from django.conf import settings

class Topic(models.Model):
    topicName = models.CharField(max_length=200)
    createdBy = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='created_topics'
    )
    creationDate = models.DateTimeField(auto_now_add=True)
    interactionCount = models.IntegerField(default=0)

    def __str__(self):
        return self.topicName

    class Meta:
        db_table = 'topics'
        ordering = ['-creationDate']
        indexes = [
            models.Index(fields=['creationDate']),
        ]
