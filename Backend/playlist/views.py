from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from django.db.models import Count
from .models import Playlist, Song
from .serializers import PlaylistSerializer, SongSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def playlist_list(request):
    """Public Makda playlists with search"""
    query = request.GET.get('search', '')
    playlists = Playlist.objects.filter(is_public=True)
    if query:
        playlists = playlists.filter(name__icontains=query)
    serializer = PlaylistSerializer(playlists, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_playlists(request):
    """User's own playlists"""
    if request.method == 'GET':
        playlists = Playlist.objects.filter(user=request.user)
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = PlaylistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_song(request, playlist_id):
    """Add single song"""
    try:
        playlist = Playlist.objects.get(id=playlist_id, user=request.user)
    except Playlist.DoesNotExist:
        return Response({"error": "Playlist not found"}, status=404)
    
    serializer = SongSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(playlist=playlist)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def playlist_stats(request):
    """Playlist system statistics"""
    stats = {
        "total_playlists": Playlist.objects.count(),
        "total_songs": Song.objects.count(),
        "public_playlists": Playlist.objects.filter(is_public=True).count(),
        "top_artists": Song.objects.values('artist').annotate(count=Count('id')).order_by('-count')[:5],
    }
    return Response(stats)