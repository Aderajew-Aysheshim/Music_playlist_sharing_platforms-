from django.urls import path
from . import views

urlpatterns = [
    # Core
    path('playlists/', views.playlist_list, name='makda-playlist-list'),
    path('my-playlists/', views.my_playlists, name='makda-my-playlists'),
    
    # Actions
    path('playlists/<int:playlist_id>/add-song/', views.add_song, name='makda-add-song'),
    
    # Analytics
    path('stats/', views.playlist_stats, name='makda-stats'),
]