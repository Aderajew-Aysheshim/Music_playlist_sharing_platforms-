from django.db import models
from django.contrib.auth.models import User

class Playlist(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='makda_playlists')
    is_public = models.BooleanField(default=True)
    cover_image = models.ImageField(upload_to='makda_covers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Makda: {self.name}"
    
    @property
    def song_count(self):
        return self.makda_songs.count()

class Song(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='makda_songs')
    spotify_url = models.URLField(blank=True, null=True)
    duration = models.CharField(max_length=10, blank=True)  # "3:45"
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.artist}"