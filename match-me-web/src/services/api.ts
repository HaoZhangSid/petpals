// src/services/api.ts
import axios from 'axios';

// 创建 axios 实例
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // 这将是真实API的地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
        // 未授权 - 可能需要重新登录
        localStorage.removeItem('token');
        // 可以在这里触发重定向到登录页
      }
    }
    return Promise.reject(error);
  }
);