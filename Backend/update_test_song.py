import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playlist_api.settings')
django.setup()

from core.models import Song

try:
    s = Song.objects.get(id=1)
    # Using triple-quoted string for actual newlines
    s.synced_lyrics = """[00:00] Music starts...
[00:03] Get ready!
[00:06] [Sing along now]
[00:10] Welcome to the MusiConnect platform!
[00:15] Practice your English with local tracks.
[00:20] Watch the lyrics grow as you sing!
[00:25] It highlights the correct line perfectly.
[00:30] Keep practicing and enjoy the music!"""
    s.save()
    print(f"Successfully updated synced_lyrics for: {s.title}")
except Exception as e:
    print(f"Error: {e}")
