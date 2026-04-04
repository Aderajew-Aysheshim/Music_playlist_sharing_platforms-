import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playlist_api.settings')
django.setup()

from core.models import Song

try:
    s = Song.objects.get(id=1)
    s.title = "ለኛ ብሎ ነው"
    s.artist = "ዘማሪ ዲያቆን አቤል መክብብ"
    s.lyrics = """ሕይወት ሊሰጠን
በመስቀል የዋለው 
ለኛ ብሎ ነው 
በመስቀል የዋለው"""
    s.synced_lyrics = """[00:00] ለኛ ብሎ ነው
[00:05] ሕይወት ሊሰጠን
[00:10] በመስቀል የዋለው 
[00:15] ለኛ ብሎ ነው 
[00:20] በመስቀል የዋለው"""
    s.save()
    print(f"Successfully updated song with Amharic data: {s.title} by {s.artist}")
except Exception as e:
    print(f"Error: {e}")
