import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('finance_token');
      const storedUser = localStorage.getItem('finance_user');
      if (storedToken && storedUser) {
        try {
          set({
            token: storedToken,
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            isLoading: false
          });
          return;
        } catch (e) {
          localStorage.removeItem('finance_token');
          localStorage.removeItem('finance_user');
        }
      }
    }
    set({ isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('finance_token', token);
        localStorage.setItem('finance_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('finance_token', token);
        localStorage.setItem('finance_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finance_token');
      localStorage.removeItem('finance_user');
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  }
}));
