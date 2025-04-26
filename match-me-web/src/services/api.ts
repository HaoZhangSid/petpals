// src/services/api.ts
import axios from 'axios';
import { useUserStore } from '../store/userStore'; // Import the store
import { Photo } from '../types';

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
        console.error("Unauthorized (401) error detected. Clearing user state.");
        // Call the store's clearUser action for clean state management
        useUserStore.getState().clearUser();
        // Optionally: Force a redirect to login page after state update
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Uploads one or more photos for the current user.
 * @param formData FormData containing the photos under the key 'photos', and optionally 'caption' and 'isPrimary'.
 * @returns Promise<Photo[]> Array of created photo objects.
 */
export const uploadUserPhotos = async (formData: FormData): Promise<Photo[]> => {
  const response = await api.post<Photo[]>('/api/v1/me/photos', formData, {
    // Axios will automatically set Content-Type to multipart/form-data for FormData
  });
  return response.data;
};

/**
 * Sets a specific photo as the primary avatar for the current user.
 * @param photoId The ID of the photo to set as primary.
 * @returns Promise<Photo> The updated photo object.
 */
export const setPrimaryPhoto = async (photoId: string): Promise<Photo> => {
  const response = await api.patch<Photo>(`/api/v1/photos/${photoId}/primary`);
  return response.data;
};

/**
 * Deletes a specific photo belonging to the current user.
 * @param photoId The ID of the photo to delete.
 * @returns Promise<void>
 */
export const deletePhoto = async (photoId: string): Promise<void> => {
  await api.delete(`/api/v1/photos/${photoId}`);
};