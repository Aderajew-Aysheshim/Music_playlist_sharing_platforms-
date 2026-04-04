import mimetypes

from django.db import transaction
from django.db.models import Count, Exists, F, OuterRef, Prefetch, Q
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Playlist,
    PlaylistCollaborator,
    PlaylistComment,
    PlaylistLike,
    PlaylistSong,
    ShareLink,
    Song,
)
from .pagination import StandardResultsSetPagination
from .permissions import (
    PlaylistAccessPermission,
    SongWritePermission,
    can_manage_playlist,
    can_view_playlist,
)
from .serializers import (
    PlaylistCollaboratorSerializer,
    PlaylistCollaboratorWriteSerializer,
    PlaylistCommentSerializer,
    PlaylistCommentWriteSerializer,
    PlaylistDetailSerializer,
    PlaylistListSerializer,
    PlaylistSerializer,
    PlaylistSongWriteSerializer,
    PublicPlaylistSerializer,
    SongSerializer,
    UserSerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def parse_bool(value):
    if value is None:
        return None
    if value.lower() in ['true', '1', 'yes']:
        return True
    if value.lower() in ['false', '0', 'no']:
        return False
    return None


def require_authenticated(request):
    if not request.user or not request.user.is_authenticated:
        raise NotAuthenticated('Authentication credentials were not provided.')


def require_playlist_view_access(request, playlist):
    if can_view_playlist(request.user, playlist):
        return
    if not request.user or not request.user.is_authenticated:
        raise NotAuthenticated('Authentication credentials were not provided.')
    raise PermissionDenied('You do not have access to this playlist.')


def require_playlist_owner(request, playlist):
    require_authenticated(request)
    if not can_manage_playlist(request.user, playlist):
        raise PermissionDenied('Only the playlist owner can perform this action.')


def annotated_playlist_queryset(request=None):
    playlist_song_queryset = PlaylistSong.objects.select_related('song').order_by('order')
    collaborator_queryset = PlaylistCollaborator.objects.select_related(
        'user',
        'added_by',
    ).order_by('created_at')

    queryset = Playlist.objects.select_related('user').prefetch_related(
        Prefetch('playlist_songs', queryset=playlist_song_queryset),
        Prefetch('collaborators', queryset=collaborator_queryset),
        'share_links',
    ).annotate(
        songs_count=Count('playlist_songs', distinct=True),
        likes_count=Count('likes', distinct=True),
        comments_count=Count('comments', distinct=True),
        collaborators_count=Count('collaborators', distinct=True),
    )

    if request and request.user.is_authenticated:
        queryset = queryset.annotate(
            is_liked=Exists(
                PlaylistLike.objects.filter(
                    playlist_id=OuterRef('pk'),
                    user=request.user,
                )
            )
        )

    return queryset


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {
                'tokens': tokens,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        from django.contrib.auth import authenticate

        authenticated_user = authenticate(username=username, password=password)

        if not authenticated_user:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = get_tokens_for_user(authenticated_user)
        return Response(
            {
                'tokens': tokens,
                'user': UserSerializer(authenticated_user).data,
            }
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'refresh': 'This field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({'error': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_205_RESET_CONTENT)


class SongViewSet(viewsets.ModelViewSet):
    serializer_class = SongSerializer
    permission_classes = [SongWritePermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'artist', 'uploaded_by__username']
    ordering_fields = ['title', 'artist', 'created_at', 'id']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = Song.objects.select_related('uploaded_by').all()
        artist = self.request.query_params.get('artist')
        uploaded_by = self.request.query_params.get('uploaded_by')
        if artist:
            queryset = queryset.filter(artist__icontains=artist)
        if uploaded_by:
            queryset = queryset.filter(uploaded_by__username__icontains=uploaded_by)
        return queryset

    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_scope = 'upload'
        elif self.action == 'stream':
            self.throttle_scope = 'stream'
        return super().get_throttles()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def stream(self, request, pk=None):
        song = self.get_object()
        try:
            file_handle = song.audio_file.open('rb')
        except FileNotFoundError as exc:
            raise Http404('Audio file not found.') from exc
        content_type = mimetypes.guess_type(song.audio_file.name)[0] or 'application/octet-stream'
        file_response = FileResponse(
            file_handle,
            content_type=content_type,
            as_attachment=False,
            filename=song.audio_file.name.rsplit('/', 1)[-1],
        )
        file_response['Content-Disposition'] = f'inline; filename="{song.audio_file.name.rsplit("/", 1)[-1]}"'
        return file_response


class PublicPlaylistViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PublicPlaylistSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'user__username']
    ordering_fields = ['created_at', 'name', 'songs_count', 'likes_count', 'comments_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = annotated_playlist_queryset(self.request).filter(is_public=True)
        owner = self.request.query_params.get('owner')
        if owner:
            queryset = queryset.filter(user__username__icontains=owner)
        return queryset.distinct()


class SharedPlaylistRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = PublicPlaylistSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'token'

    def get_object(self):
        return get_object_or_404(
            annotated_playlist_queryset(self.request),
            share_links__token=self.kwargs['token'],
        )


class PlaylistViewSet(viewsets.ModelViewSet):
    permission_classes = [PlaylistAccessPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'user__username']
    ordering_fields = [
        'created_at',
        'name',
        'songs_count',
        'likes_count',
        'comments_count',
        'collaborators_count',
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = annotated_playlist_queryset(self.request)

        if self.action != 'list':
            return queryset.distinct()

        require_authenticated(self.request)
        scope = self.request.query_params.get('scope', 'all')
        role = self.request.query_params.get('role')
        is_public = parse_bool(self.request.query_params.get('is_public'))
        owner = self.request.query_params.get('owner')

        if scope == 'liked':
            queryset = queryset.filter(likes__user=self.request.user)
        else:
            queryset = queryset.filter(
                Q(user=self.request.user) | Q(collaborators__user=self.request.user)
            )
            if scope == 'owned':
                queryset = queryset.filter(user=self.request.user)
            elif scope == 'collaborating':
                queryset = queryset.filter(collaborators__user=self.request.user)

        if role == 'owner':
            queryset = queryset.filter(user=self.request.user)
        elif role in [PlaylistCollaborator.Role.EDITOR, PlaylistCollaborator.Role.VIEWER]:
            queryset = queryset.filter(
                collaborators__user=self.request.user,
                collaborators__role=role,
            )

        if is_public is not None:
            queryset = queryset.filter(is_public=is_public)
        if owner:
            queryset = queryset.filter(user__username__icontains=owner)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return PlaylistListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return PlaylistSerializer
        if self.action == 'add_song':
            return PlaylistSongWriteSerializer
        return PlaylistDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        playlist = serializer.save(user=request.user)
        ShareLink.objects.create(playlist=playlist)
        refreshed_playlist = annotated_playlist_queryset(request).get(pk=playlist.pk)
        return Response(
            PlaylistDetailSerializer(
                refreshed_playlist,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        refreshed_playlist = annotated_playlist_queryset(request).get(pk=instance.pk)
        return Response(
            PlaylistDetailSerializer(
                refreshed_playlist,
                context=self.get_serializer_context(),
            ).data
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={'playlist': playlist},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        refreshed_playlist = annotated_playlist_queryset(request).get(pk=playlist.pk)
        return Response(
            PlaylistDetailSerializer(
                refreshed_playlist,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'])
    def remove_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        playlist_song = get_object_or_404(PlaylistSong, playlist=playlist, song_id=song_id)

        with transaction.atomic():
            removed_order = playlist_song.order
            playlist_song.delete()
            PlaylistSong.objects.filter(
                playlist=playlist,
                order__gt=removed_order,
            ).update(order=F('order') - 1)

        refreshed_playlist = annotated_playlist_queryset(request).get(pk=playlist.pk)
        return Response(
            PlaylistDetailSerializer(
                refreshed_playlist,
                context=self.get_serializer_context(),
            ).data
        )


class PlaylistCollaboratorListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_playlist(self):
        playlist = get_object_or_404(annotated_playlist_queryset(self.request), pk=self.kwargs['pk'])
        require_playlist_owner(self.request, playlist)
        return playlist

    def get_queryset(self):
        playlist = self.get_playlist()
        return playlist.collaborators.select_related('user', 'added_by').order_by('created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlaylistCollaboratorWriteSerializer
        return PlaylistCollaboratorSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['playlist'] = self.get_playlist()
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        collaborator = serializer.save(
            playlist=self.get_playlist(),
            added_by=request.user,
        )
        return Response(
            PlaylistCollaboratorSerializer(collaborator).data,
            status=status.HTTP_201_CREATED,
        )


class PlaylistCollaboratorDetailAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PlaylistCollaboratorWriteSerializer

    def get_playlist(self):
        playlist = get_object_or_404(annotated_playlist_queryset(self.request), pk=self.kwargs['pk'])
        require_playlist_owner(self.request, playlist)
        return playlist

    def get_object(self):
        return get_object_or_404(
            self.get_playlist().collaborators.select_related('user', 'added_by'),
            pk=self.kwargs['collaborator_id'],
        )

    def put(self, request, *args, **kwargs):
        collaborator = self.get_object()
        serializer = self.get_serializer(
            collaborator,
            data=request.data,
            context={'playlist': collaborator.playlist},
        )
        serializer.is_valid(raise_exception=True)
        collaborator = serializer.save()
        return Response(PlaylistCollaboratorSerializer(collaborator).data)

    def delete(self, request, *args, **kwargs):
        collaborator = self.get_object()
        collaborator.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PlaylistCommentListCreateAPIView(generics.ListCreateAPIView):
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'user__username']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_playlist(self):
        return get_object_or_404(annotated_playlist_queryset(self.request), pk=self.kwargs['pk'])

    def get_queryset(self):
        playlist = self.get_playlist()
        require_playlist_view_access(self.request, playlist)
        queryset = playlist.comments.select_related('user').order_by('-created_at')
        user = self.request.query_params.get('user')
        if user:
            queryset = queryset.filter(user__username__icontains=user)
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlaylistCommentWriteSerializer
        return PlaylistCommentSerializer

    def create(self, request, *args, **kwargs):
        playlist = self.get_playlist()
        require_authenticated(request)
        require_playlist_view_access(request, playlist)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(playlist=playlist, user=request.user)
        return Response(
            PlaylistCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )


class PlaylistCommentDetailAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PlaylistCommentWriteSerializer

    def get_playlist(self):
        playlist = get_object_or_404(annotated_playlist_queryset(self.request), pk=self.kwargs['pk'])
        require_playlist_view_access(self.request, playlist)
        return playlist

    def get_object(self):
        return get_object_or_404(
            self.get_playlist().comments.select_related('user'),
            pk=self.kwargs['comment_id'],
        )

    def put(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied('You can only edit your own comments.')
        serializer = self.get_serializer(comment, data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        return Response(PlaylistCommentSerializer(comment).data)

    def delete(self, request, *args, **kwargs):
        comment = self.get_object()
        if (
            comment.user_id != request.user.id
            and comment.playlist.user_id != request.user.id
            and not request.user.is_staff
        ):
            raise PermissionDenied('You can only delete your own comments.')
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PlaylistLikeAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_playlist(self):
        playlist = get_object_or_404(annotated_playlist_queryset(self.request), pk=self.kwargs['pk'])
        require_playlist_view_access(self.request, playlist)
        return playlist

    def post(self, request, *args, **kwargs):
        playlist = self.get_playlist()
        PlaylistLike.objects.get_or_create(playlist=playlist, user=request.user)
        refreshed = annotated_playlist_queryset(request).get(pk=playlist.pk)
        return Response({'liked': True, 'likes_count': refreshed.likes_count})

    def delete(self, request, *args, **kwargs):
        playlist = self.get_playlist()
        PlaylistLike.objects.filter(playlist=playlist, user=request.user).delete()
        refreshed = annotated_playlist_queryset(request).get(pk=playlist.pk)
        return Response({'liked': False, 'likes_count': refreshed.likes_count})
