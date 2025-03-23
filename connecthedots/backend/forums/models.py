from django.db import models
from topics.models import Topic

class Forum(models.Model):
    topic = models.ForeignKey('topics.Topic', on_delete=models.CASCADE, related_name='forums')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forums'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['topic']),
        ]

    def __str__(self):
        return self.title
