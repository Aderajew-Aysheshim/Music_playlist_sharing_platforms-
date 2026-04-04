from django.urls import path
from . import views

urlpatterns = [
    path('playlists/', views.playlist_list, name='playlist-list'),
    path('playlists/create/', views.create_playlist, name='create-playlist'),
    path('playlists/<int:playlist_id>/add-song/', views.add_song, name='add-song'),
]