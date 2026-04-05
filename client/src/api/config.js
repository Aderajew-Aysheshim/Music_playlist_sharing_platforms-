const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return 'http://127.0.0.1:8000/api/';
  }

  return value.endsWith('/') ? value : `${value}/`;
};

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
);
