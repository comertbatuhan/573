# Generated by Django 5.1.7 on 2025-04-05 17:29

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("forums", "0002_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="forum",
            name="description",
        ),
        migrations.RemoveField(
            model_name="forum",
            name="title",
        ),
    ]
