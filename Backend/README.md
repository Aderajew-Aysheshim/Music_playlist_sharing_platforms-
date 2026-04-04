# MusiConnect Backend

Django REST API for a music playlist sharing platform.

## What It Supports

- JWT registration, login, logout, and token refresh
- Song upload with basic file validation
- Secure song updates and deletes by uploader only
- Song streaming endpoint
- Playlist create, list, retrieve, update, and delete
- Ordered songs inside playlists
- Public and private playlists
- Shareable token-based playlist links
- Collaborators with `editor` and `viewer` roles
- Playlist comments and likes
- Pagination, search, filtering, and ordering
- Django admin for all core models

## Main Endpoints

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/logout/`
- `POST /api/token/refresh/`
- `GET /api/songs/`
- `POST /api/songs/`
- `GET /api/songs/{id}/`
- `PATCH /api/songs/{id}/`
- `DELETE /api/songs/{id}/`
- `GET /api/songs/{id}/stream/`
- `GET /api/playlists/`
- `POST /api/playlists/`
- `GET /api/playlists/{id}/`
- `PUT /api/playlists/{id}/`
- `DELETE /api/playlists/{id}/`
- `POST /api/playlists/{id}/add_song/`
- `POST /api/playlists/{id}/remove_song/`
- `GET /api/public/playlists/`
- `GET /api/public/playlists/{id}/`
- `GET /api/share/{token}/`
- `GET /api/playlists/{id}/collaborators/`
- `POST /api/playlists/{id}/collaborators/`
- `PUT /api/playlists/{id}/collaborators/{collaborator_id}/`
- `DELETE /api/playlists/{id}/collaborators/{collaborator_id}/`
- `GET /api/playlists/{id}/comments/`
- `POST /api/playlists/{id}/comments/`
- `PUT /api/playlists/{id}/comments/{comment_id}/`
- `DELETE /api/playlists/{id}/comments/{comment_id}/`
- `POST /api/playlists/{id}/like/`
- `DELETE /api/playlists/{id}/like/`

## Security Improvements Included

- Environment-driven Django settings
- Default pagination and throttling
- JWT refresh rotation with blacklist support
- Restricted CORS configuration by default
- Upload validation for audio and cover images
- Owner-only song modification
- Private playlists hidden unless public, shared, or explicitly authorized
- Safer repository setup with `.gitignore` and `.env.example`

## Setup

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Environment Variables

Use `.env.example` as a starting point.

Important settings:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CORS_ALLOW_ALL_ORIGINS`

## Running Checks

```bash
python manage.py check
python manage.py test
```
