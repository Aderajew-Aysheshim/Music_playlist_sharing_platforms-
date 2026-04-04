import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playlist_api.settings')
django.setup()

from core.models import  Song

for song in Song.objects.all().order_by('-id')[:5]:
    print(f"ID: {song.id}, Title: {song.title}, Synced length: {len(song.synced_lyrics) if song.synced_lyrics else 'None'}")
