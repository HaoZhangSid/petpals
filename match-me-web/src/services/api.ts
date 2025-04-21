// src/services/api.ts
import axios from 'axios';
import { useUserStore } from '../store/userStore'; // Import the store

// 创建 axios 实例
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // 这将是真实API的地址
  timeout: 10000,
  // headers: { // Remove default Content-Type
  //   'Content-Type': 'application/json',
  // }
});

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  (config) => {
    // Get token from Zustand store
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理常见错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一处理错误
    if (error.response) {
      // 服务器返回错误状态码
      if (error.response.status === 401) {
        // 未授权 - token可能无效或过期
        console.error("Unauthorized (401) error detected. Logging out.");
        // Call the store's logout action for clean state management
        useUserStore.getState().logout(); 
        // Optionally: Force a redirect to login page after state update
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);