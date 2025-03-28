# Generated by Django 5.1.7 on 2025-03-20 20:21

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("usernodes", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="usernode",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="user_nodes",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddIndex(
            model_name="usernode",
            index=models.Index(
                fields=["creationDate"], name="usernodes_creatio_014f07_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="usernode",
            index=models.Index(fields=["node"], name="usernodes_node_id_f5aa97_idx"),
        ),
    ]
