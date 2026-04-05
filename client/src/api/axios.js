import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

const refreshClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

const clearSession = () => {
  localStorage.clear();
  window.location.href = '/login';
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const shouldAttemptRefresh = (
      error.response.status === 401
      && !originalRequest._retry
      && !originalRequest.url?.includes('login/')
      && !originalRequest.url?.includes('register/')
      && !originalRequest.url?.includes('token/refresh/')
    );

    if (shouldAttemptRefresh) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await refreshClient.post('token/refresh/', {
            refresh: refreshToken,
          });

          if (data.access) {
            localStorage.setItem('accessToken', data.access);
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${data.access}`,
            };
          }

          if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh);
          }

          return api(originalRequest);
        } catch (_refreshError) {
          clearSession();
        }
      }

      clearSession();
    }

    return Promise.reject(error);
  }
);

export default api;
