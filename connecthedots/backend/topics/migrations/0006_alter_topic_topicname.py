# Generated by Django 5.1.7 on 2025-04-05 17:29

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("topics", "0005_alter_topic_topicname"),
    ]

    operations = [
        migrations.AlterField(
            model_name="topic",
            name="topicName",
            field=models.CharField(max_length=200),
        ),
    ]
