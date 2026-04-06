from rest_framework import serializers
from .models import Song, Playlist

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'audio_file', 'cover_image', 'uploaded_by', 'created_at']


class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)   # Shows full song details

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'description', 'user', 'songs', 'is_public', 'created_at']
        read_only_fields = ['user']
