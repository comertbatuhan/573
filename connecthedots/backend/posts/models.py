from django.db import models
from django.contrib.auth import get_user_model
from topics.models import Topic

User = get_user_model()

class Post(models.Model):
    topic = models.ForeignKey('topics.Topic', on_delete=models.CASCADE, related_name='posts')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Post by {self.user.username} on {self.topic}'

    class Meta:
        db_table = 'posts'
        ordering = ['-creation_date']
        indexes = [
            models.Index(fields=['creation_date']),
            models.Index(fields=['topic']),
        ]
