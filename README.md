# 🎵 MusiConnect - Music Playlist Sharing Platform

A modern, responsive music playlist sharing platform built with React and Django REST Framework. Features collaborative playlists, real-time music streaming, and a beautiful dark-themed UI.

## ✨ Features

### 🎧 Core Functionality
- **Music Upload & Streaming**: Upload MP3, WAV, OGG, M4A, FLAC files with cover art
- **Playlist Management**: Create, edit, and organize personal playlists
- **Collaborative Playlists**: Add collaborators with editor/viewer roles
- **Public Discovery**: Browse and share public playlists with the community
- **Share Links**: Generate token-based shareable playlist links

### 🎨 User Experience
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Dark Theme**: Beautiful glassmorphism design with dark mode
- **Real-time Audio Player**: Stream music with progress controls and volume adjustment
- **Lyrics Support**: Full lyrics and synced lyrics for practice mode
- **Search & Discovery**: Search playlists and songs with intelligent filtering

### 🔐 Security & Performance
- **JWT Authentication**: Secure token-based authentication with refresh rotation
- **File Validation**: Comprehensive audio and image file validation
- **Rate Limiting**: API throttling to prevent abuse
- **CORS Protection**: Configurable cross-origin resource sharing
## 🛠 Technology Stack

### Frontend
- **React 18+** with Vite for fast development
- **React Router** for client-side routing
- **Axios** for API communication with interceptors
- **Lucide React** for modern icons
- **Pure CSS** with CSS variables and modern features

### Backend
- **Django 4.x** with Django REST Framework
- **SQLite** database (easily configurable for PostgreSQL/MySQL)
- **JWT** authentication with Simple JWT
- **Pillow** for image processing
- **CORS Headers** for frontend integration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Music_playlist_sharing_platforms-.git
   cd Music_playlist_sharing_platforms-
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   pip install -r requirements.txt
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your settings
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser (optional)
   python manage.py createsuperuser
   
   # Start backend server
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api/
   - Admin Panel: http://localhost:8000/admin/

## 📱 Responsive Design

The application features a fully responsive design that adapts seamlessly across devices:

### Desktop (1024px+)
- Two-column layout with persistent sidebar
- Full music player with expanded controls
- Grid layouts for songs and playlists

### Tablet (768px - 1024px)
- Collapsible sidebar with hamburger menu
- Optimized grid layouts
- Touch-friendly controls

### Mobile (480px - 768px)
- Single-column layout
- Slide-out navigation drawer
- Compact music player
- Vertical stacking of elements

### Small Mobile (< 480px)
- Minimalist interface
- Large touch targets
- Simplified navigation

## 🎵 Music Features

### Supported Audio Formats
- MP3, WAV, OGG, M4A, FLAC
- Maximum file size: 20MB
- Automatic audio validation

### Image Support
- JPEG, PNG, WebP for cover art
- Maximum file size: 5MB
- Automatic image optimization

### Playlist Features
- Drag-and-drop song ordering
- Auto-fill by artist
- Public/private visibility
- Collaborator management
- Comments and likes system

## 🔧 Configuration

### Environment Variables

Backend (.env):
```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Frontend (.env):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/register/` - User registration
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `POST /api/token/refresh/` - Refresh access token

### Music Endpoints
- `GET /api/songs/` - List songs
- `POST /api/songs/` - Upload song
- `GET /api/songs/{id}/stream/` - Stream audio
- `PATCH /api/songs/{id}/` - Update song
- `DELETE /api/songs/{id}/` - Delete song

### Playlist Endpoints
- `GET /api/playlists/` - List user playlists
- `POST /api/playlists/` - Create playlist
- `GET /api/playlists/{id}/` - Get playlist details
- `PUT /api/playlists/{id}/` - Update playlist
- `DELETE /api/playlists/{id}/` - Delete playlist
- `POST /api/playlists/{id}/add_song/` - Add song to playlist
- `POST /api/playlists/{id}/remove_song/` - Remove song from playlist

## 🎨 Design System

### Color Palette
- **Primary**: #22d465 (Green)
- **Accent**: #f97316 (Orange)
- **Background**: #07090f (Dark)
- **Surface**: rgba(15, 18, 28, 0.90)
- **Text**: #eef0f6 (Light)

### Typography
- **Primary Font**: Inter (UI elements)
- **Heading Font**: Plus Jakarta Sans (Headers)
- **Font Sizes**: 0.7rem - 2.5rem with responsive scaling

### Components
- Glassmorphism panels with backdrop blur
- Smooth animations and transitions
- Hover states and micro-interactions
- Loading states and error handling

## 🔒 Security Features

- JWT token authentication with rotation
- File upload validation and sanitization
- CORS configuration
- Rate limiting on sensitive endpoints
- SQL injection protection (Django ORM)
- XSS protection (Django templates)

## 🚀 Performance Optimizations

- Lazy loading of images
- Audio streaming with range requests
- Efficient pagination
- Optimized bundle size with Vite
- CSS custom properties for theming
- Debounced search inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Lucide Icons for beautiful iconography
- Django REST Framework for robust API development
- Vite for fast development experience
- React community for inspiration and best practices

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**MusiConnect** - Connect through music 🎵
