from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from core.views import (
    LoginView,
    LogoutView,
    PlaylistCollaboratorDetailAPIView,
    PlaylistCollaboratorListCreateAPIView,
    PlaylistCommentDetailAPIView,
    PlaylistCommentListCreateAPIView,
    PlaylistLikeAPIView,
    PlaylistViewSet,
    PublicPlaylistViewSet,
    RegisterView,
    SharedPlaylistRetrieveAPIView,
    SongViewSet,
)


from playlist.views import (
    playlist_list,
    create_playlist,
    add_song,
)

router = DefaultRouter()
router.register(r'songs', SongViewSet, basename='song')
router.register(r'playlists', PlaylistViewSet, basename='playlist')
router.register(r'browse', PublicPlaylistViewSet, basename='browse')

admin.site.site_header = "MusiConnect Admin"
admin.site.site_title = "MusiConnect Admin Portal"
admin.site.index_title = "Welcome to MusiConnect Admin Portal"
admin.site.site_url = "http://localhost:5173/"

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Existing playlist features
    path(
        'api/public/playlists/',
        PublicPlaylistViewSet.as_view({'get': 'list'}),
        name='public-playlist-list',
    ),
    path(
        'api/public/playlists/<int:pk>/',
        PublicPlaylistViewSet.as_view({'get': 'retrieve'}),
        name='public-playlist-detail',
    ),
    path(
        'api/playlists/<int:pk>/collaborators/',
        PlaylistCollaboratorListCreateAPIView.as_view(),
        name='playlist-collaborator-list',
    ),
    path(
        'api/playlists/<int:pk>/collaborators/<int:collaborator_id>/',
        PlaylistCollaboratorDetailAPIView.as_view(),
        name='playlist-collaborator-detail',
    ),
    path(
        'api/playlists/<int:pk>/comments/',
        PlaylistCommentListCreateAPIView.as_view(),
        name='playlist-comment-list',
    ),
    path(
        'api/playlists/<int:pk>/comments/<int:comment_id>/',
        PlaylistCommentDetailAPIView.as_view(),
        name='playlist-comment-detail',
    ),
    path(
        'api/playlists/<int:pk>/like/',
        PlaylistLikeAPIView.as_view(),
        name='playlist-like',
    ),
    path('api/share/<str:token>/', SharedPlaylistRetrieveAPIView.as_view(), name='shared-playlist'),
    
    # MAKDA'S PLAYLIST CORE SYSTEM 👩‍💻 (YOUR ADDITIONS)
    path('api/makda/playlists/', playlist_list, name='makda-playlist-list'),
    path('api/makda/playlists/create/', create_playlist, name='makda-create-playlist'),
    path('api/makda/playlists/<int:playlist_id>/add-song/', add_song, name='makda-add-song'),
    
    # Router (existing)
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)