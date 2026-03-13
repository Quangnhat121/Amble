import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5000/api'; // đổi thành IP thật khi test trên device

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Gắn token vào mọi request
api.interceptors.request.use(async (config) => {
  const userToken    = await AsyncStorage.getItem('amble_token');
  const partnerToken = await AsyncStorage.getItem('amble_partner_token');
  const token = userToken || partnerToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth API ────────────────────────────────────────────
export const authAPI = {
  register: (data: { fullName: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Partner Auth API ────────────────────────────────────
export const partnerAuthAPI = {
  register: (data: {
    ownerName: string; email: string; password: string; phone: string;
    restaurantName: string; restaurantAddress?: string; restaurantCity?: string;
    cuisine?: string; subscriptionPackage?: 'basic' | 'pro' | 'premium';
  }) => api.post('/partner/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/partner/auth/login', data),
  getMe: () => api.get('/partner/auth/me'),
};

// ── User API ────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: {
    fullName?: string; phone?: string; bio?: string;
    location?: string; avatar?: string;
  }) => api.put('/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
  toggleFavoriteRoute: (routeId: string) => api.post(`/users/favorite/${routeId}`),
};

// ── Restaurant API ──────────────────────────────────────
export const restaurantAPI = {
  /** Lấy tất cả, hỗ trợ filter */
  getAll: (params?: {
    city?: string;
    cuisine?: string;
    category?: string;
    search?: string;
  }) => api.get('/restaurants', { params }),

  /** Chỉ lấy featured */
  getFeatured: () => api.get('/restaurants/featured'),

  /** Chi tiết 1 nhà hàng */
  getById: (id: string) => api.get(`/restaurants/${id}`),
};

// ── Routes API (walking — giữ lại nếu dùng) ────────────
export const routesAPI = {
  getAll: (params?: { difficulty?: string; search?: string }) =>
    api.get('/routes', { params }),
  getPopular: () => api.get('/routes/popular'),
  getById: (id: string) => api.get(`/routes/${id}`),
};

export default api;