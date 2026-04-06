from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Song, Playlist
from .serializers import SongSerializer, PlaylistSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication

# Song Views
class SongListCreateView(generics.ListCreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class SongDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# === YOUR PLAYLIST CORE SYSTEM ===
class PlaylistListCreateView(generics.ListCreateAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PlaylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]


class AddSongToPlaylistView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        playlist.songs.add(song)
        return Response({"message": "Song added successfully"}, status=status.HTTP_200_OK)


class RemoveSongFromPlaylistView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        playlist.songs.remove(song)
        return Response({"message": "Song removed successfully"}, status=status.HTTP_200_OK)