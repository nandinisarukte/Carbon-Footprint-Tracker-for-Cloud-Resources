import axios from 'axios';
import { auth, isConfigured, mockAuth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Firebase ID Token
api.interceptors.request.use(
  async (config) => {
    let token = null;

    if (isConfigured && auth && auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken(true);
      } catch (error) {
        console.error('Error getting Firebase ID Token:', error);
      }
    } else if (!isConfigured && mockAuth.currentUser) {
      token = await mockAuth.currentUser.getIdToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
