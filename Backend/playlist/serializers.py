from rest_framework import serializers
from .models import Playlist, Song
from django.contrib.auth.models import User
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'

class PlaylistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    song_count = serializers.ReadOnlyField()
    created_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Playlist
        fields = '__all__'
    
    def get_created_ago(self, obj):
        return obj.created_at.strftime("%b %d, %Y")