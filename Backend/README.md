# MusiConnect Backend API Documentation

Welcome to the backend of the **MusiConnect** Playlist Sharing Application! This documentation provides a comprehensive guide to understanding the backend architecture, the database schema, and the exact API endpoints powering the platform.

---

## 🛠 Technology Stack
- **Framework:** Django 5+
- **API Architecture:** Django REST Framework (DRF)
- **Database:** SQLite (Default, configured for portability)
- **Authentication:** Token-based Authentication via `rest_framework.authtoken`
- **Media File Storage:** Local Filesystem (`/media/` folder)

---

## 🗄️ Database Models (Schema)

The database consists of 3 primary entities: **Users**, **Songs**, and **Playlists**. 

### 1. User
We rely on Django's built-in robust authentication models.
- **id** (Integer): Unique ID.
- **username** (String): Unique username.
- **email** (String): User's email.
- **password** (String): Hashed securely.

### 2. Song
Represents a unique piece of music uploaded to the platform.
- **id**: Primary Key.
- **title** (CharField): Title of the song.
- **artist** (CharField): Artist/Band name.
- **audio_file** (FileField): The raw media file (MP3, WAV), stored in `media/songs/`.
- **cover_image** (ImageField): Optional album artwork, stored in `media/covers/`.
- **uploaded_by** (ForeignKey to User): The user who originally deposited this song into the platform.
- **created_at** (DateTimeField): Timestamp of upload.

### 3. Playlist
Represents a curated list of songs belonging to a specific user.
- **id**: Primary Key.
- **name** (CharField): Custom name for the playlist.
- **description** (TextField): Optional description.
- **user** (ForeignKey to User): The owner of the playlist.
- **songs** (ManyToManyField to Song): Relationships between songs and this playlist. A playlist can contain many songs, and a song can exist in many playlists.
- **created_at** (DateTimeField): Timestamp of creation.

---

## 📡 API Endpoints

All API endpoints reside beneath the `http://127.0.0.1:8000/api/` prefix.

### 🔐 Authentication

| Endpoint | Method | Role | Payload (Body) |
|----------|--------|------|----------------|
| `/api/register/` | **POST** | Creates a new user | `{ "username": "x", "email": "x", "password": "x" }` |
| `/api/login/` | **POST** | Logs in existing user, returns a Token | `{ "username": "x", "password": "x" }` |
| `/api/logout/` | **POST** | Deletes current token (Requires Auth) | *None* |

### 🎵 Song Resources 

| Endpoint | Method | Role | Requirements |
|----------|--------|------|--------------|
| `/api/songs/` | **GET** | Fetch all globally available songs | *None (Public)* |
| `/api/songs/` | **POST** | Upload a new song (Requires Auth) | `multipart/form-data` with `audio_file`, `title`, and `artist` |
| `/api/songs/{id}/` | **GET** | Retrieve metadata for a specific song | *None (Public)* |
| `/api/songs/{id}/stream/` | **GET** | Return the raw streaming file as an attachment | *None (Public)* |

### 💽 Playlist Resources

All playlist actions **strictly require an Authentication Token** (e.g. `Authorization: Token 12345`).

| Endpoint | Method | Role | Payload (Body) |
|----------|--------|------|----------------|
| `/api/playlists/` | **GET** | Fetch only the playlists belonging to the *current user* | *None* |
| `/api/playlists/` | **POST** | Create a brand new empty playlist | `{ "name": "Chill Vibes" }` |
| `/api/playlists/{id}/` | **DELETE** | Permanently delete a specific playlist | *None* |
| `/api/playlists/{id}/add_song/` | **POST** | Append an existing song into the playlist | `{ "song_id": 12 }` |
| `/api/playlists/{id}/remove_song/`| **POST**| Evict an existing song from the playlist | `{ "song_id": 12 }` |

---

## 📻 Media Streaming & Download Files

Media storage settings are declared inside `settings.py`.
- Files natively live within `Backend/media/`
- They are openly served during development via Django's integrated `static` mechanism.

When the Front-end displays a track, it explicitly queries the `/api/songs/{id}/stream/` endpoint. This custom `FileResponse` function forces the browser to treat it as a proper binary Media Attachment, ensuring that users can correctly **Download** their favorite MP3s onto their local machine!

## 👩‍💻 Admin Panel
- **URL**: `http://127.0.0.1:8000/admin/`
- Every table is fully visible beneath the "Core" section. The Administrator dashboard acts directly upon raw database objects.
