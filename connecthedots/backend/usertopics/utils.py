from usertopics.models import UserTopics
from django.utils import timezone

def record_user_topic_action(user, topic, action_type):
    obj, created = UserTopics.objects.get_or_create(user=user, topic=topic)
    updated = False
    if action_type == 'created':
        obj.created = True
        updated = True
    elif action_type == 'posted':
        obj.posted = True
        updated = True
    elif action_type == 'addedNode':
        obj.addedNode = True
        updated = True
    
    if updated:
        topic.interactionCount += 1
        topic.save()
    obj.actionDate = timezone.now()
    obj.save()
