# Generated by Django 5.1.7 on 2025-03-20 20:21

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Topic",
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
                ("topicName", models.CharField(max_length=200)),
                ("creationDate", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "db_table": "topics",
                "ordering": ["-creationDate"],
            },
        ),
    ]
