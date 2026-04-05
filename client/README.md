# MusiConnect Frontend

React + Vite frontend for the Music Playlist Sharing Platform.

## Environment Variable

Start from [.env.example](.env.example).

Required value:

- `VITE_API_BASE_URL`

Example:

```text
VITE_API_BASE_URL=https://your-backend-domain/api/
```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm install
npm run build
```

## Deploying On Vercel

This frontend already includes [vercel.json](vercel.json) so direct route visits like `/browse` and `/playlists` rewrite to `index.html`.

Recommended Vercel settings:

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL`
