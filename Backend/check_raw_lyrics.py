import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playlist_api.settings')
django.setup()

from core.models import Song

s = Song.objects.get(id=1)
print(f"RAW: {repr(s.synced_lyrics)}")
