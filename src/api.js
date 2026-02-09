import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }
  
  try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
          }
      }
  } catch (error) {
      console.error("Error parsing user token", error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Only redirect if not already on public pages? 
        // But 403/401 implies auth failure.
        // Check message content for "deactivated" to be specific?
        if (error.response.data.message === 'Your account has been deactivated. Please contact support.') {
             localStorage.removeItem('user');
             // Only redirect if NOT on login page to avoid clearing error state
             if (window.location.pathname !== '/login') {
                 window.location.href = '/login'; 
             }
        }
    }
    return Promise.reject(error);
  }
);

export default api;
