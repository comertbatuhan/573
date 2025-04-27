from django.db import models

class Wiki(models.Model):
    qID = models.CharField(max_length=100, unique=True, primary_key=True)
    label = models.CharField(max_length=255)
    description = models.TextField()
    creationDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.label

    class Meta:
        db_table = 'wikis'
        verbose_name = 'Wiki'
        verbose_name_plural = 'Wikis'
        indexes = [models.Index(fields=['qID'])]  
