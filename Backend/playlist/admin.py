from django.contrib import admin
from .models import Playlist, Song

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'is_public', 'created_at', 'song_count']
    list_filter = ['is_public', 'created_at', 'user']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    def song_count(self, obj):
        return obj.makda_songs.count()
    song_count.short_description = 'Songs'

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'playlist', 'added_at']
    list_filter = ['added_at', 'playlist']
    search_fields = ['title', 'artist']