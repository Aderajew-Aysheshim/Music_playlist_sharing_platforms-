# MusiConnect Frontend Interface Documentation

Welcome to the frontend of the **MusiConnect** Playlist Sharing Application! This document provides a highly comprehensive guide to understanding how the React web interface functions, interacts with the backend, and presents a beautiful user experience. 

---

## 🛠 Technology Stack
- **Framework:** React 18+ via Vite
- **Routing:** `react-router-dom`
- **Network Requests:** Axios Client
- **Icons:** `lucide-react`
- **Styling Method:** Pure CSS using Modern Features (CSS Variables, Flex/Grid, Glassmorphism). *Tailwind was strictly avoided per the clean-code design spec.*

---

## 🏗 Directory Architecture

```
client/
├── index.html        # Entry point for the Vite bundler
├── package.json      # Dependencies and scripts (npm run dev)
├── src/
│   ├── App.jsx       # Global application root, handling Route distribution
│   ├── main.jsx      # React Render root
│   ├── index.css     # Global Stylesheets (Variables, Dark mode, Components)
│   ├── api/          
│   │   └── axios.js  # Dedicated API interface containing Authentication Interceptors
│   ├── components/
│   │   └── Navbar.jsx# Clean, sticky header displaying Login stats & Navigation
│   └── pages/
│       ├── Home.jsx      # Global song feed with live audio & playlist appending
│       ├── Login.jsx     # Form explicitly configured to grab Auth Tokens
│       ├── Register.jsx  # Form explicitly configured to create backend Users
│       ├── Upload.jsx    # Enables artists to upload physical MP3s directly to the DB
│       └── Playlists.jsx # Manages a user's curated song lists
```

---

## 🔗 How APIs & Authentication Intersect

The web app communicates directly with `/api/` over on port 8000 using Axios.

When a user successfully hits the **Login** or **Register** endpoints, the Backend transmits a secure Token payload. The Frontend actively caches this:
```javascript
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```
**Axios Interception Magic:** `client/src/api/axios.js` uses an advanced Request Interceptor that dynamically prepends the `Authorization: Token xxyzyz...` header to absolutely *every API call made*, allowing the Frontend to never drop session states unless the user hits Logout!

---

## 🎨 Global Styling System & Interface Feel
Our `index.css` acts as a full-fledged lightweight design library replacing generic frameworks. It uses deeply embedded CSS variables to maintain identical dark-mode color aesthetics across every screen component.
- **`.glass-panel`**: Generates a blurred background card using `backdrop-filter`, producing a highly premium glassmorphism overlay.
- **Grids & Form Controls**: Standardized classes (`.btn-primary`, `.form-input`) enforce flawless form layouts effortlessly without duplicating design variables inside `.jsx` components!

---

## 🎛 Noteworthy Page Features

### 🎧 Global Audio Player (`Home.jsx`)
When a user clicks "Play" on a song, an element called `currentSong` is set. If present, a sticky HTML `<audio>` player drops down into the bottom of the viewport featuring custom streaming configurations. It never breaks and uses actual streaming binary endpoints!

### 📥 Instant Song Transfers (`Playlists.jsx`)
Playlists now showcase our custom **"Auto-Fill" system.**
When creating a Playlist, the Frontend polls the backend for distinct `artists` located in the DB. The frontend automatically mounts a Dropdown! Choosing "Queen" when creating a playlist directly instructs the Django server's backend interceptor to append *every single Queen song existant* into that newly manifested playlist—saving hours of clicking!

## 🚀 Running the Development Server
Navigate terminal to the `client/` folder and launch the Vite bundler seamlessly:
```bash
npm install
npm run dev
```
By default, the UI will bind specifically to **http://localhost:5173/**.
