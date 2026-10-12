import axios from 'axios';
import {
  INITIAL_USERS,
  INITIAL_DESIGNS,
  INITIAL_PRICING_PLANS,
  INITIAL_REELS,
  INITIAL_ENQUIRIES,
  INITIAL_FAQS,
  STUDIO_PROFILE
} from './mockData';

// Storage Keys
export const STORAGE_KEYS = {
  USERS: 'abr_admin_users',
  DESIGNS: 'abr_admin_designs',
  PRICING: 'abr_admin_pricing',
  REELS: 'abr_admin_reels',
  ENQUIRIES: 'abr_admin_enquiries',
  FAQS: 'abr_admin_faqs',
  PROFILE: 'abr_admin_profile',
  TOKEN: 'abr_admin_token',
  REFRESH_TOKEN: 'abr_admin_refresh_token',
  AUTH_USER: 'abr_admin_auth_user'
};

// Initialize LocalStorage with default data if empty
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRICING)) {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(INITIAL_PRICING_PLANS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAQS)) {
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(INITIAL_FAQS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(STUDIO_PROFILE));
  }
};

initializeLocalStorage();

// Standard Axios Client instance pointing to https://artbyradhika-app.vercel.app
export const axiosClient = axios.create({
  baseURL: 'https://artbyradhika-app.vercel.app',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 60000
});

// Request Interceptor: Attach Authorization Bearer token automatically and ensure /api routing
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically ensure /api routing if endpoint path doesn't already include it
    if (
      config.url &&
      !config.url.startsWith('http://') &&
      !config.url.startsWith('https://') &&
      !config.url.startsWith('/api') &&
      !config.baseURL?.endsWith('/api')
    ) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 unauthenticated
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
    return Promise.reject(error);
  }
);

// Helper for Mock Local Storage persistence for client data
export const mockApi = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error('Storage save error', e);
      return data;
    }
  },
  STORAGE_KEYS
};

export default axiosClient;
