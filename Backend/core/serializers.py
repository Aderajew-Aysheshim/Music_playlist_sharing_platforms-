import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.db.models import F, Max
from rest_framework import serializers

from .models import (
    Playlist,
    PlaylistCollaborator,
    PlaylistComment,
    PlaylistSong,
    Song,
)
from .permissions import get_playlist_role

User = get_user_model()

AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a', '.flac'}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_AUDIO_SIZE = 20 * 1024 * 1024
MAX_IMAGE_SIZE = 5 * 1024 * 1024


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class SongSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    stream_url = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = [
            'id',
            'title',
            'artist',
            'audio_file',
            'cover_image',
            'lyrics',
            'synced_lyrics',
            'uploaded_by',
            'uploader_name',
            'created_at',
            'stream_url',
        ]
        read_only_fields = ['uploaded_by', 'uploader_name', 'created_at', 'stream_url']

    def get_stream_url(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        return request.build_absolute_uri(f'/api/songs/{obj.pk}/stream/')

    def validate_audio_file(self, value):
        extension = os.path.splitext(value.name)[1].lower()
        if extension not in AUDIO_EXTENSIONS:
            raise serializers.ValidationError('Unsupported audio format.')
        if value.size > MAX_AUDIO_SIZE:
            raise serializers.ValidationError('Audio file must be 20 MB or smaller.')
        content_type = getattr(value, 'content_type', '')
        if content_type and not content_type.startswith('audio/'):
            raise serializers.ValidationError('Invalid audio content type.')
        return value

    def validate_cover_image(self, value):
        extension = os.path.splitext(value.name)[1].lower()
        if extension not in IMAGE_EXTENSIONS:
            raise serializers.ValidationError('Unsupported image format.')
        if value.size > MAX_IMAGE_SIZE:
            raise serializers.ValidationError('Cover image must be 5 MB or smaller.')
        content_type = getattr(value, 'content_type', '')
        if content_type and not content_type.startswith('image/'):
            raise serializers.ValidationError('Invalid image content type.')
        return value


class PlaylistSongSerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)

    class Meta:
        model = PlaylistSong
        fields = ['id', 'order', 'song']


class PlaylistCollaboratorSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    added_by = serializers.CharField(source='added_by.username', read_only=True)

    class Meta:
        model = PlaylistCollaborator
        fields = ['id', 'user', 'role', 'added_by', 'created_at']
        read_only_fields = fields

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
        }


class PlaylistCollaboratorWriteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(required=False, write_only=True)
    username = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = PlaylistCollaborator
        fields = ['id', 'user_id', 'username', 'role']
        read_only_fields = ['id']

    def validate(self, attrs):
        playlist = self.context['playlist']
        user_id = attrs.get('user_id')
        username = attrs.get('username')

        if self.instance is None and not user_id and not username:
            raise serializers.ValidationError({'user_id': 'Provide either user_id or username.'})

        if self.instance is not None and (user_id or username):
            raise serializers.ValidationError({'user_id': 'Updating collaborator user is not supported.'})

        if self.instance is None:
            if user_id:
                user = User.objects.filter(pk=user_id).first()
            else:
                user = User.objects.filter(username=username).first()

            if user is None:
                raise serializers.ValidationError({'user_id': 'The selected user does not exist.'})
            if playlist.user_id == user.id:
                raise serializers.ValidationError({'user_id': 'The owner is already assigned to the playlist.'})
            if playlist.collaborators.filter(user_id=user.id).exists():
                raise serializers.ValidationError({'user_id': 'This user is already a collaborator.'})

            attrs['user'] = user

        return attrs

    def create(self, validated_data):
        validated_data.pop('user_id', None)
        validated_data.pop('username', None)
        return PlaylistCollaborator.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('user_id', None)
        validated_data.pop('username', None)
        instance.role = validated_data.get('role', instance.role)
        instance.save(update_fields=['role'])
        return instance


class PlaylistCommentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = PlaylistComment
        fields = ['id', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = fields

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
        }


class PlaylistCommentWriteSerializer(serializers.ModelSerializer):
    content = serializers.CharField(max_length=1000)

    class Meta:
        model = PlaylistComment
        fields = ['id', 'content']
        read_only_fields = ['id']


class PlaylistListSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='user.username', read_only=True)
    songs_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    collaborators_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = [
            'id',
            'name',
            'description',
            'owner_name',
            'is_public',
            'created_at',
            'songs_count',
            'likes_count',
            'comments_count',
            'collaborators_count',
            'is_liked',
            'user_role',
        ]
        read_only_fields = fields

    def get_is_liked(self, obj):
        annotated_value = getattr(obj, 'is_liked', None)
        if annotated_value is not None:
            return annotated_value

        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.likes.filter(user=user).exists()

    def get_user_role(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return get_playlist_role(user, obj)


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'description', 'is_public']
        read_only_fields = ['id']


class PlaylistDetailSerializer(PlaylistListSerializer):
    songs = PlaylistSongSerializer(source='playlist_songs', many=True, read_only=True)
    share_token = serializers.SerializerMethodField()
    share_url = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()

    class Meta(PlaylistListSerializer.Meta):
        fields = PlaylistListSerializer.Meta.fields + [
            'share_token',
            'share_url',
            'songs',
            'collaborators',
        ]
        read_only_fields = fields

    def get_share_token(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated or (not user.is_staff and obj.user_id != user.id):
            return None
        share_link = next(iter(obj.share_links.all()), None)
        return share_link.token if share_link else None

    def get_share_url(self, obj):
        request = self.context.get('request')
        share_token = self.get_share_token(obj)
        if not request or not share_token:
            return None
        return request.build_absolute_uri(f'/api/share/{share_token}/')

    def get_collaborators(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated or (not user.is_staff and obj.user_id != user.id):
            return []
        return PlaylistCollaboratorSerializer(obj.collaborators.all(), many=True).data


class PublicPlaylistSerializer(PlaylistListSerializer):
    songs = PlaylistSongSerializer(source='playlist_songs', many=True, read_only=True)

    class Meta(PlaylistListSerializer.Meta):
        fields = PlaylistListSerializer.Meta.fields + ['songs']
        read_only_fields = fields


class PlaylistSongWriteSerializer(serializers.Serializer):
    song_id = serializers.IntegerField()
    order = serializers.IntegerField(required=False, min_value=1)

    def validate(self, attrs):
        playlist = self.context['playlist']
        song_id = attrs['song_id']

        try:
            song = Song.objects.get(pk=song_id)
        except Song.DoesNotExist as exc:
            raise serializers.ValidationError({'song_id': 'Song not found.'}) from exc

        if playlist.playlist_songs.filter(song_id=song_id).exists():
            raise serializers.ValidationError({'song_id': 'Song is already in this playlist.'})

        max_order = playlist.playlist_songs.aggregate(max_order=Max('order'))['max_order'] or 0
        requested_order = attrs.get('order', max_order + 1)
        if requested_order > max_order + 1:
            raise serializers.ValidationError(
                {'order': f'Order must be between 1 and {max_order + 1}.'}
            )

        attrs['song'] = song
        attrs['order'] = requested_order
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        playlist = self.context['playlist']
        order = validated_data['order']

        PlaylistSong.objects.filter(
            playlist=playlist,
            order__gte=order,
        ).update(order=F('order') + 1)

        return PlaylistSong.objects.create(
            playlist=playlist,
            song=validated_data['song'],
            order=order,
        )
