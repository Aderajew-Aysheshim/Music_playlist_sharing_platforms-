const BASE_URL = "http://127.0.0.1:8000/api";

// Helper: Fetch with auth + auto refresh
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  let res = await fetch(url, options);

  if (res.status === 401 && refreshToken) {
    // Try refreshing token
    const refreshRes = await fetch(`${BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshRes.ok) {
      localStorage.clear();
      window.location.href = "/login"; // redirect to login
      return;
    }

    const refreshData = await refreshRes.json();
    localStorage.setItem("access_token", refreshData.access);

    // Retry original request
    options.headers.Authorization = `Bearer ${refreshData.access}`;
    res = await fetch(url, options);
  }

  if (res.status === 403) {
    alert("No permission");
    throw new Error("Forbidden");
  }

  return res.json();
}

// GET paginated playlists
export const getPlaylists = async (page = 1) => {
  const data = await fetchWithAuth(`${BASE_URL}/playlists/?page=${page}`);
  return data.results || data; // handle pagination
};

// GET playlist details (including songs)
export const getPlaylistDetail = async (id) => {
  return await fetchWithAuth(`${BASE_URL}/playlists/${id}/`);
};

// CREATE playlist
export const createPlaylist = async (playlistData) => {
 
  const payload = {
    name: playlistData.name,
    description: playlistData.description || "",
    is_public: playlistData.is_public ?? true,
  };

  return await fetchWithAuth(`${BASE_URL}/playlists/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};