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

export default api;
