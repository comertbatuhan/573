from django.test import TestCase
from django.contrib.auth import get_user_model
from topics.models import Topic
from wikis.models import Wiki
from .models import Node

User = get_user_model()

class NodeModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.topic = Topic.objects.create(
            topicName='Test Topic',
            description='Test Description',
            createdBy=self.user
        )
        self.wiki = Wiki.objects.create(
            qID='Q123',
            label='Test Wiki',
            description='Test Wiki Description'
        )
        self.node_data = {
            'manual_name': 'Test Node',
            'qid': self.wiki,
            'topic': self.topic,
            'created_by_user': self.user,
            'description': 'Test Node Description',
            'position_x': 100,
            'position_y': 200
        }
        self.node = Node.objects.create(**self.node_data)

    def test_create_node(self):
        self.assertEqual(self.node.manual_name, 'Test Node')
        self.assertEqual(self.node.qid, self.wiki)
        self.assertEqual(self.node.topic, self.topic)
        self.assertEqual(self.node.created_by_user, self.user)
        self.assertEqual(self.node.description, 'Test Node Description')
        self.assertEqual(self.node.position_x, 100)
        self.assertEqual(self.node.position_y, 200)

    def test_node_str_method(self):
        self.assertEqual(str(self.node), 'Test Node')

    def test_node_creation_date(self):
        self.assertIsNotNone(self.node.creation_date)

