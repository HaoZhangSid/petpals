// src/services/api.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/userStore'; // Import the store
import { Photo } from '../types';

// Define baseURL directly
const API_BASE_URL = 'http://localhost:8080'; 

// 创建 axios 实例
export const api = axios.create({
  baseURL: API_BASE_URL, 
  timeout: 10000,
});

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  // Add types to config
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // Add type to error
  (error: AxiosError) => Promise.reject(error)
);

// 响应拦截器 - 处理常见错误
api.interceptors.response.use(
  // Add type to response
  (response: AxiosResponse) => response,
  // Add type to error
  (error: AxiosError) => {
    // 统一处理错误
    if (error.response) {
      // 服务器返回错误状态码
      if (error.response.status === 401) {
        console.error("Unauthorized (401) error detected. Clearing user state.");
        useUserStore.getState().clearUser();
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

/**
 * Uploads one or more photos for a specific pet.
 * @param petId The ID of the pet to associate the photos with.
 * @param formData FormData containing the photos under the key 'photos'.
 * @returns Promise<Photo[]> Array of created photo objects.
 */
export const uploadPetPhotos = async (petId: string, formData: FormData): Promise<Photo[]> => {
  // Corrected path
  const response = await api.post<Photo[]>(`/api/v1/me/pets/${petId}/photos`, formData);
  return response.data;
};

/**
 * Sets a specific photo as the primary avatar for its associated pet.
 * Backend needs to determine the pet based on the photoId and update the pet's avatarUrl.
 * @param photoId The ID of the photo to set as the pet's avatar.
 * @returns Promise<Photo> The updated photo object (likely with isPrimary=true).
 */
export const setPetAvatar = async (photoId: string): Promise<Photo> => {
  const response = await api.patch<Photo>(`/api/v1/photos/${photoId}/pet-avatar`);
  return response.data;
};