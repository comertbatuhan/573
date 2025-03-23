# Generated by Django 5.1.7 on 2025-03-20 20:21

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("topics", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserTopics",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "creationDate",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                (
                    "topic",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_topics",
                        to="topics.topic",
                    ),
                ),
            ],
            options={
                "verbose_name": "User Topic",
                "verbose_name_plural": "User Topics",
                "db_table": "user_topics",
            },
        ),
    ]
