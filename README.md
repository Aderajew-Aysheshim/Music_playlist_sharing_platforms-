# Music Playlist Sharing Platform

This repository contains two deployable applications:

- `client/` — the React + Vite frontend
- `Backend/` — the Django REST API backend

## Deployment Layout

Deploy the applications separately:

1. Deploy `Backend/` as a Python web service
2. Deploy `client/` as a static frontend
3. Set the frontend `VITE_API_BASE_URL` to the deployed backend API URL

Example production API base URL:

```text
https://your-backend-domain/api/
```

## Backend Deployment Summary

The backend is now prepared for:

- environment-driven Django settings
- PostgreSQL through `DATABASE_URL`
- static file collection through WhiteNoise
- Gunicorn process startup
- optional media serving through `DJANGO_SERVE_MEDIA=True`

See [Backend/README.md](Backend/README.md) for the full backend setup.

## Frontend Deployment Summary

The frontend is now prepared for:

- environment-driven API base URL through `VITE_API_BASE_URL`
- SPA rewrites for Vercel through `client/vercel.json`

See [client/README.md](client/README.md) for the frontend setup.
