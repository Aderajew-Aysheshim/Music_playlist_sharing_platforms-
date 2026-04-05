export const getStoredUser = () => {
  const rawUser = localStorage.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (_error) {
    localStorage.removeItem('user');
    return null;
  }
};

export const hasStoredAccessToken = () => Boolean(localStorage.getItem('accessToken'));
