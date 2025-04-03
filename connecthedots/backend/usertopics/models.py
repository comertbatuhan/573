from django.db import models
from django.utils import timezone
from django.conf import settings

class UserTopics(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_topics')
    topic = models.ForeignKey('topics.Topic', on_delete=models.CASCADE, related_name='user_topics')
    posted = models.BooleanField(default=False)
    created = models.BooleanField(default=False)
    addedNode = models.BooleanField(default=False)
    actionDate = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'user_topics'
        verbose_name = 'User Topic'
        verbose_name_plural = 'User Topics'
        unique_together = ['user', 'topic']

    def __str__(self):
        return f"{self.user.username} - {self.topic.topicName}"
