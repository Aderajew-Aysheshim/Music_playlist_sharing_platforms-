import uuid

from django.conf import settings
from django.db import models


def generate_share_token():
    return uuid.uuid4().hex


class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    audio_file = models.FileField(upload_to='songs/')
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)
    lyrics = models.TextField(null=True, blank=True)
    synced_lyrics = models.TextField(null=True, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_songs',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.artist}'


class Playlist(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='playlists',
    )
    is_public = models.BooleanField(default=False)
    songs = models.ManyToManyField(
        Song,
        through='PlaylistSong',
        related_name='playlists',
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class PlaylistSong(models.Model):
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='playlist_songs',
    )
    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        related_name='playlist_entries',
    )
    order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'core_playlist_songs'
        ordering = ['order']
        unique_together = [('playlist', 'song')]
        indexes = [
            models.Index(fields=['playlist', 'order']),
        ]

    def __str__(self):
        return f'{self.playlist.name}: {self.song.title} ({self.order})'


class ShareLink(models.Model):
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='share_links',
    )
    token = models.CharField(max_length=64, unique=True, default=generate_share_token)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Share link for {self.playlist.name}'


class PlaylistCollaborator(models.Model):
    class Role(models.TextChoices):
        VIEWER = 'viewer', 'Viewer'
        EDITOR = 'editor', 'Editor'

    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='collaborators',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='playlist_collaborations',
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VIEWER)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_playlist_collaborations',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        unique_together = [('playlist', 'user')]
        indexes = [
            models.Index(fields=['playlist', 'role']),
        ]

    def __str__(self):
        return f'{self.user} on {self.playlist} ({self.role})'


class PlaylistComment(models.Model):
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='playlist_comments',
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['playlist', 'created_at']),
        ]

    def __str__(self):
        return f'Comment by {self.user} on {self.playlist}'


class PlaylistLike(models.Model):
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='playlist_likes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('playlist', 'user')]

    def __str__(self):
        return f'{self.user} likes {self.playlist}'
