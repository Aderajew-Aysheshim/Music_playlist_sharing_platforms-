from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    Playlist,
    PlaylistCollaborator,
    PlaylistComment,
    PlaylistLike,
    PlaylistSong,
    ShareLink,
    Song,
)

User = get_user_model()


def sample_audio_file(name='sample.mp3'):
    return SimpleUploadedFile(name, b'fake-audio-data', content_type='audio/mpeg')


def sample_image_file(name='cover.jpg'):
    return SimpleUploadedFile(name, b'fake-image-data', content_type='image/jpeg')


class BackendSecurityAndFeatureTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='StrongPass123!',
        )
        self.editor = User.objects.create_user(
            username='editor',
            email='editor@example.com',
            password='StrongPass123!',
        )
        self.viewer = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='StrongPass123!',
        )
        self.outsider = User.objects.create_user(
            username='outsider',
            email='outsider@example.com',
            password='StrongPass123!',
        )

    def authenticate(self, user):
        self.client.force_authenticate(user)

    def create_song(self, user, title='Song A', artist='Artist A'):
        return Song.objects.create(
            title=title,
            artist=artist,
            audio_file=sample_audio_file(f'{title}.mp3'),
            cover_image=sample_image_file(f'{title}.jpg'),
            uploaded_by=user,
        )

    def create_playlist(self, user=None, name='Playlist A', is_public=False):
        user = user or self.owner
        playlist = Playlist.objects.create(
            name=name,
            description=f'{name} description',
            user=user,
            is_public=is_public,
        )
        ShareLink.objects.create(playlist=playlist)
        return playlist

    def test_register_returns_tokens(self):
        response = self.client.post(
            reverse('register'),
            {
                'username': 'newuser',
                'email': 'new@example.com',
                'password': 'StrongPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_only_uploader_can_modify_song(self):
        song = self.create_song(self.owner)

        self.authenticate(self.outsider)
        patch_response = self.client.patch(
            reverse('song-detail', kwargs={'pk': song.pk}),
            {'title': 'Updated Title'},
            format='json',
        )

        self.assertEqual(patch_response.status_code, status.HTTP_403_FORBIDDEN)

        self.authenticate(self.owner)
        owner_patch_response = self.client.patch(
            reverse('song-detail', kwargs={'pk': song.pk}),
            {'title': 'Updated Title'},
            format='json',
        )

        self.assertEqual(owner_patch_response.status_code, status.HTTP_200_OK)
        song.refresh_from_db()
        self.assertEqual(song.title, 'Updated Title')

    def test_public_browse_only_returns_public_playlists(self):
        self.create_playlist(self.owner, name='Private One', is_public=False)
        public_playlist = self.create_playlist(self.owner, name='Public One', is_public=True)

        response = self.client.get(reverse('browse-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], public_playlist.id)

    def test_private_playlist_is_accessible_by_share_link(self):
        playlist = self.create_playlist(self.owner, name='Private Shared', is_public=False)
        share_link = playlist.share_links.first()

        direct_response = self.client.get(reverse('playlist-detail', kwargs={'pk': playlist.pk}))
        shared_response = self.client.get(
            reverse('shared-playlist', kwargs={'token': share_link.token})
        )

        self.assertIn(
            direct_response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
        self.assertEqual(shared_response.status_code, status.HTTP_200_OK)
        self.assertEqual(shared_response.data['name'], playlist.name)

    def test_editor_can_add_song_and_viewer_cannot(self):
        playlist = self.create_playlist(self.owner, name='Collaborative Mix', is_public=False)
        song = self.create_song(self.owner)
        PlaylistCollaborator.objects.create(
            playlist=playlist,
            user=self.editor,
            role=PlaylistCollaborator.Role.EDITOR,
            added_by=self.owner,
        )
        PlaylistCollaborator.objects.create(
            playlist=playlist,
            user=self.viewer,
            role=PlaylistCollaborator.Role.VIEWER,
            added_by=self.owner,
        )

        self.authenticate(self.editor)
        editor_response = self.client.post(
            reverse('playlist-add-song', kwargs={'pk': playlist.pk}),
            {'song_id': song.pk, 'order': 1},
            format='json',
        )

        self.authenticate(self.viewer)
        viewer_response = self.client.post(
            reverse('playlist-add-song', kwargs={'pk': playlist.pk}),
            {'song_id': song.pk, 'order': 1},
            format='json',
        )

        self.assertEqual(editor_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(viewer_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_comment_and_like_permissions(self):
        playlist = self.create_playlist(self.owner, name='Public Discussion', is_public=True)

        anonymous_comment = self.client.post(
            reverse('playlist-comment-list', kwargs={'pk': playlist.pk}),
            {'content': 'Nice playlist'},
            format='json',
        )
        self.assertEqual(anonymous_comment.status_code, status.HTTP_401_UNAUTHORIZED)

        self.authenticate(self.outsider)
        comment_response = self.client.post(
            reverse('playlist-comment-list', kwargs={'pk': playlist.pk}),
            {'content': 'Nice playlist'},
            format='json',
        )
        like_response = self.client.post(reverse('playlist-like', kwargs={'pk': playlist.pk}))

        self.assertEqual(comment_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(like_response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            PlaylistComment.objects.filter(playlist=playlist, user=self.outsider).exists()
        )
        self.assertTrue(
            PlaylistLike.objects.filter(playlist=playlist, user=self.outsider).exists()
        )

    def test_playlist_song_order_is_maintained(self):
        playlist = self.create_playlist(self.owner, name='Ordered Playlist', is_public=False)
        song_a = self.create_song(self.owner, title='Song A', artist='Artist A')
        song_b = self.create_song(self.owner, title='Song B', artist='Artist B')
        song_c = self.create_song(self.owner, title='Song C', artist='Artist C')

        self.authenticate(self.owner)
        self.client.post(
            reverse('playlist-add-song', kwargs={'pk': playlist.pk}),
            {'song_id': song_a.pk},
            format='json',
        )
        self.client.post(
            reverse('playlist-add-song', kwargs={'pk': playlist.pk}),
            {'song_id': song_b.pk},
            format='json',
        )
        self.client.post(
            reverse('playlist-add-song', kwargs={'pk': playlist.pk}),
            {'song_id': song_c.pk, 'order': 2},
            format='json',
        )

        playlist.refresh_from_db()
        ordered_ids = list(
            PlaylistSong.objects.filter(playlist=playlist).order_by('order').values_list('song_id', flat=True)
        )
        self.assertEqual(ordered_ids, [song_a.pk, song_c.pk, song_b.pk])

    def test_playlist_list_supports_scope_search_and_pagination(self):
        liked_playlist = self.create_playlist(self.owner, name='Road Trip', is_public=True)
        self.create_playlist(self.owner, name='Road Work', is_public=False)
        collaborative = self.create_playlist(self.outsider, name='Shared Focus', is_public=False)
        PlaylistCollaborator.objects.create(
            playlist=collaborative,
            user=self.owner,
            role=PlaylistCollaborator.Role.EDITOR,
            added_by=self.outsider,
        )
        PlaylistLike.objects.create(playlist=liked_playlist, user=self.owner)

        self.authenticate(self.owner)
        owned_response = self.client.get(
            reverse('playlist-list'),
            {'scope': 'owned', 'search': 'Road', 'page_size': 1},
        )
        liked_response = self.client.get(
            reverse('playlist-list'),
            {'scope': 'liked'},
        )
        collaborating_response = self.client.get(
            reverse('playlist-list'),
            {'scope': 'collaborating'},
        )

        self.assertEqual(owned_response.status_code, status.HTTP_200_OK)
        self.assertEqual(owned_response.data['count'], 2)
        self.assertEqual(len(owned_response.data['results']), 1)
        self.assertEqual(liked_response.data['count'], 1)
        self.assertEqual(liked_response.data['results'][0]['name'], 'Road Trip')
        self.assertEqual(collaborating_response.data['count'], 1)
        self.assertEqual(collaborating_response.data['results'][0]['name'], 'Shared Focus')
