from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Topic

User = get_user_model()

class TopicModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.topic_data = {
            'topicName': 'Test Topic',
            'description': 'This is a test topic',
            'createdBy': self.user
        }
        self.topic = Topic.objects.create(**self.topic_data)

    def test_create_topic(self):
        self.assertEqual(self.topic.topicName, 'Test Topic')
        self.assertEqual(self.topic.description, 'This is a test topic')
        self.assertEqual(self.topic.createdBy, self.user)
        self.assertEqual(self.topic.interactionCount, 0)

    def test_topic_str_method(self):
        self.assertEqual(str(self.topic), 'Test Topic')

    def test_topic_creation_date(self):
        self.assertIsNotNone(self.topic.creationDate)

