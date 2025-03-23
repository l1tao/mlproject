import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set, get) => ({
  // 认证状态
  user: null,
  isAuthenticated: null,
  isLoading: false,
  error: null,
  
  // 登录方法
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      set({ 
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'login failed，please check username and password',
        isLoading: false,
        isAuthenticated: false
      });
      return false;
    }
  },
  
  // 注册方法
  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/auth/register', { username, password });
      localStorage.setItem('token', response.data.token);
      set({ 
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'register failed，please try again later',
        isLoading: false
      });
      return false;
    }
  },
  
  // 登出方法
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  
  // 检查认证状态
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      // 设置请求头中的认证令牌
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/me');
      set({ 
        user: response.data,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },
  
  // 清除错误信息
  clearError: () => set({ error: null })
}));

// 设置axios拦截器，自动添加认证令牌到请求头
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);