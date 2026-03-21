import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// const BASE_URL = 'http://localhost:5000/api'; // iOS simulator
// const BASE_URL = 'http://192.168.x.x:5000/api'; // Real device — đổi IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const userToken    = await AsyncStorage.getItem('amble_token');
  const partnerToken = await AsyncStorage.getItem('amble_partner_token');
  const token = userToken || partnerToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data: { fullName: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Partner Auth ────────────────────────────────────────
export const partnerAuthAPI = {
  register: (data: {
    ownerName: string; email: string; password: string; phone: string;
    restaurantName: string; restaurantAddress?: string; restaurantCity?: string;
    cuisine?: string; subscriptionPackage?: 'basic' | 'pro' | 'premium';
  }) => api.post('/partner/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/partner/auth/login', data),
  getMe: () => api.get('/partner/auth/me'),
   logout: () => api.post('/partner/auth/logout'),
};

// ── Partner Restaurant Setup ───────────────────────────
export const partnerRestaurantAPI = {
  setupRestaurant: (data: {
    name: string;
    description?: string;
    cuisines?: string[];
    suitableFor?: string[];
    priceMin?: number;
    priceMax?: number;
    city: string;
    address: string;
    phone: string;
    openTime?: string;
    closeTime?: string;
    openDays?: string[];
    hasParking?: boolean;
    instagram?: string;
    facebook?: string;
    website?: string;
    images?: string[];
  }) => api.put('/partner/restaurants/setup', data),
};

// ── User ────────────────────────────────────────────────
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

// ── Restaurant ──────────────────────────────────────────
export const restaurantAPI = {
  getAll: (params?: { city?: string; cuisine?: string; category?: string; search?: string }) =>
    api.get('/restaurants', { params }),
  getFeatured: () => api.get('/restaurants/featured'),
  getById: (id: string) => api.get(`/restaurants/${id}`),
};

// ── Booking ─────────────────────────────────────────────
export const bookingAPI = {
  // Bàn của nhà hàng
  getTables: (restaurantId: string) =>
    api.get(`/booking/tables/${restaurantId}`),

  // Tạo booking (1 bước: create + confirm + pay)
  create: (data: {
    userId: string;
    restaurantId: string;
    tableId: string;
    date: string;
    time: string;
    partySize: number;
    purpose?: string;
    specialRequests?: string;
    paymentMethod: string;
    voucherCode?: string;
    voucherDiscount?: number;
  }) => api.post('/booking/create', data),

  // Lịch sử booking của user
  getUserBookings: (userId: string) =>
    api.get(`/booking/user/${userId}`),

  // Chi tiết 1 booking
  getById: (bookingId: string) =>
    api.get(`/booking/${bookingId}`),

  // Hủy booking
  cancel: (bookingId: string, reason?: string) =>
    api.delete(`/booking/${bookingId}/cancel`, { data: { reason } }),

  // AI conversation
  processMessage: (data: { message: string; sessionId?: string; userId?: string }) =>
    api.post('/booking/conversation', data),

  getSession: (sessionId: string) =>
    api.get(`/booking/session/${sessionId}`),
};

// ── Routes ──────────────────────────────────────────────
export const routesAPI = {
  getAll: (params?: { difficulty?: string; search?: string }) =>
    api.get('/routes', { params }),
  getPopular: () => api.get('/routes/popular'),
  getById: (id: string) => api.get(`/routes/${id}`),
};

export default api;