import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "playlist_api.settings")
django.setup()

from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print("Admin user created.")
else:
    print("Admin user already exists.")
