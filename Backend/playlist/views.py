from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Playlist, Song
from .serializers import PlaylistSerializer, SongSerializer

@api_view(['GET'])
def playlist_list(request):
    playlists = Playlist.objects.filter(is_public=True)
    serializer = PlaylistSerializer(playlists, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_playlist(request):
    serializer = PlaylistSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_song(request, playlist_id):
    playlist = Playlist.objects.get(id=playlist_id)
    serializer = SongSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(playlist=playlist)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)