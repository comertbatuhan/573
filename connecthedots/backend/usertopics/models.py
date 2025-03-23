from django.db import models
from django.utils import timezone

class UserTopics(models.Model):
    topic = models.ForeignKey('topics.Topic', on_delete=models.CASCADE, related_name='user_topics')
    creationDate = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'user_topics'
        verbose_name = 'User Topic'
        verbose_name_plural = 'User Topics'

    def __str__(self):
        return f"Topic {self.topicID}"
