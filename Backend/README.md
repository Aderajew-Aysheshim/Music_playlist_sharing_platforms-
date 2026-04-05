# MusiConnect Backend

Django REST API for the Music Playlist Sharing Platform.

## Production Readiness

This backend is now configured for:

- environment-based configuration
- PostgreSQL via `DATABASE_URL`
- WhiteNoise static file serving
- Gunicorn startup
- optional media serving for uploaded files

## Required Environment Variables

Start from [.env.example](.env.example).

Important values:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_FRONTEND_SITE_URL`
- `DATABASE_URL`

Optional deployment values:

- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `DJANGO_MEDIA_ROOT`
- `DJANGO_MEDIA_URL`
- `DJANGO_STATIC_ROOT`
- `DJANGO_SERVE_MEDIA=True`
- `DJANGO_SECURE_SSL_REDIRECT=True`

## Install

```bash
pip install -r requirements.txt
```

## Development

```bash
python manage.py migrate
python manage.py runserver
```

## Deployment Commands

Build command:

```bash
./build.sh
```

Start command:

```bash
gunicorn playlist_api.wsgi:application
```

If your host supports Procfiles, [Procfile](Procfile) is already included.

## Notes About Uploaded Media

This project stores uploaded songs and cover images as media files. For production, use one of these:

- a persistent disk on the backend host
- object storage such as S3 in a later upgrade

For MVP deployments on a single backend service, `DJANGO_SERVE_MEDIA=True` can be used so Django serves uploaded files directly.

## Checks

```bash
python manage.py check --deploy
python manage.py migrate
python manage.py test
```
