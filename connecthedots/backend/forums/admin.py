from django.contrib import admin
from .models import Forum

@admin.register(Forum)
class ForumAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'created_at', 'updated_at')
    list_filter = ('topic', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
