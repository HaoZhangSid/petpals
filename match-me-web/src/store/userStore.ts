import { create } from 'zustand';
import axios from 'axios';
import { api } from '../services/api';
import { User, LoginCredentials, LoginResponse, Photo } from '../types/index';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  uploadUserPhotos as apiUploadUserPhotos, 
  setPrimaryPhoto as apiSetPrimaryPhoto, 
  deletePhoto as apiDeletePhoto
} from '../services/api';

interface UserState {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  setUser: (user: User | null, token: string | null) => void;
  clearUser: () => void;
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  registerUser: (userData: any) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (userData: Partial<Pick<User, 'name' | 'location' | 'phone' | 'bio' | 'interests'>>) => Promise<void>;
  uploadUserPhotos: (formData: FormData) => Promise<void>;
  setPrimaryPhoto: (photoId: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(persist(
  (set, get) => ({
    user: null,
    token: null,
    isInitializing: true,
    isLoading: false,
    isUploading: false,
    error: null,

    setUser: (user, token) => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
      set({ user, token, isInitializing: false, isLoading: false, error: null });
    },

    clearUser: () => {
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, token: null, isInitializing: false, isLoading: false, error: null });
    },

    loginUser: async (credentials: LoginCredentials) => {
      set({ isLoading: true, error: null, isInitializing: false });
      try {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        const { token } = response.data;
        get().setUser(null, token);
      } catch (error) {
        let errorMessage = "Login failed. Please check your credentials.";
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (axios.isAxiosError(error) && error.response?.status === 401) {
          errorMessage = "Invalid email or password.";
        }
        console.error("Login Error:", error);
        set({ error: errorMessage, isLoading: false, user: null, token: null });
      }
    },

    registerUser: async (userData) => {
      set({ isLoading: true, error: null, isInitializing: false });
      try {
        await api.post('/auth/register', userData);
        set({ isLoading: false });
      } catch (error) {
        let errorMessage = "Registration failed. Please try again.";
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
         console.error("Registration Error:", error);
        set({ error: errorMessage, isLoading: false });
      }
    },

    fetchUserProfile: async () => {
      const token = get().token;
      if (!get().isInitializing && !token) return; 
      if (get().isInitializing && !token) {
        set({ isInitializing: false });
        return;
      }
      
      if (!token) return; 

      set({ isLoading: true, error: null });
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/api/v1/me');
        set({ user: response.data as User, isLoading: false, isInitializing: false, error: null });
        
      } catch (error) {
        console.error("Fetch User Profile Error:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.warn("fetchUserProfile: Token invalid or expired.")
          get().clearUser();
        } else {
          set({ error: "Failed to load profile.", isLoading: false, isInitializing: false });
        }
      }
    },
    
    updateUserProfile: async (userData: Partial<Pick<User, 'name' | 'location' | 'phone' | 'bio' | 'interests'>>) => {
      console.log("Attempting to update user profile via store with JSON data:", userData);
      const token = get().token;
      if (!token) {
        const errorMsg = 'Authentication required';
        set({ error: errorMsg, isLoading: false });
        throw new Error(errorMsg);
      }
      set({ isLoading: true, error: null });
      try {
        const response = await api.patch<User>('/api/v1/me', userData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }); 
        const updatedUserFromBackend = response.data;
        
        if (updatedUserFromBackend && updatedUserFromBackend.id) {
          console.log("User profile updated successfully on backend. Merging request data into local state.");
          
          set(state => ({
            user: {
              ...state.user,
              ...userData,
              id: state.user?.id || updatedUserFromBackend.id,
              email: state.user?.email || updatedUserFromBackend.email,
              avatarUrl: state.user?.avatarUrl,
              photoUrls: state.user?.photoUrls,
              createdAt: state.user?.createdAt || updatedUserFromBackend.createdAt,
              updatedAt: updatedUserFromBackend.updatedAt,
            } as User,
            isLoading: false
          }));
        } else {
          console.error("Update Profile Error: Invalid data received from backend", response.data);
          throw new Error("Invalid user data received after update.");
        }
      } catch (error) {
        let errorMessage = "Failed to update profile.";
        if (axios.isAxiosError(error)) {
           console.error("Update Profile Axios Error:", error.response?.data || error.message);
           errorMessage = error.response?.data?.error || error.message || errorMessage;
        } else {
           console.error("Update Profile Non-Axios Error:", error);
        }
        set({ error: errorMessage, isLoading: false });
        throw new Error(errorMessage);
      }
    },
    
    uploadUserPhotos: async (formData) => {
      set({ isUploading: true, error: null });
      try {
        const uploadedPhotos = await apiUploadUserPhotos(formData);
        set(state => {
          if (!state.user) return {}; 
          const currentPhotoUrls = state.user.photoUrls || [];
          const newPhotoUrls = uploadedPhotos.map(p => p.url);
          const primaryPhoto = uploadedPhotos.find(p => p.isPrimary);
          const currentPhotos = state.user.photos || []; 
          return {
            user: {
              ...state.user,
              photoUrls: [...currentPhotoUrls, ...newPhotoUrls],
              photos: [...currentPhotos, ...uploadedPhotos],
              avatarUrl: primaryPhoto ? primaryPhoto.url : state.user.avatarUrl,
            },
            isUploading: false
          };
        });
      } catch (error) {
        console.error("Upload User Photos Error:", error);
        let errorMessage = "Failed to upload photos.";
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        set({ error: errorMessage, isUploading: false });
        throw error;
      }
    },

    setPrimaryPhoto: async (photoId) => {
      set({ isLoading: true, error: null }); 
      console.log(`[UserStore] Attempting to set primary photo: ${photoId}`);
      try {
        await apiSetPrimaryPhoto(photoId); 
        console.log(`[UserStore] API call for setPrimaryPhoto successful (no error thrown).`);

        set(state => {
          console.log(`[UserStore] State *before* setPrimaryPhoto update (local logic):`, state.user);
          if (!state.user) {
            console.error("[UserStore] User is null, cannot update photos.");
            return { isLoading: false }; 
          }
          
          const originalPhotos = state.user.photos || [];
          let newAvatarUrl = state.user.avatarUrl;
          let photoFound = false;

          const updatedPhotos = originalPhotos.map(p => {
            let isNowPrimary = (p.id === photoId);
            if (isNowPrimary) {
               photoFound = true;
               newAvatarUrl = p.url;
               console.log(`[UserStore] Found matching photo in state, setting avatarUrl to: ${newAvatarUrl}`);
               return { ...p, isPrimary: true };
            } else if (p.isPrimary) {
               return { ...p, isPrimary: false };
            }
            return p;
          });
          
          if (!photoFound && originalPhotos.length > 0) {
             console.warn(`[UserStore] SetPrimaryPhoto: Photo ID ${photoId} was not found in the current state's photos array after successful API call. Avatar URL might not be updated correctly.`);
          }

          const newUserState: User = {
            ...(state.user as User),
            avatarUrl: newAvatarUrl,
            photos: updatedPhotos
          };
          
          console.log(`[UserStore] State *after* setPrimaryPhoto update (local logic, new object):`, newUserState);

          return {
            user: newUserState, 
            isLoading: false
          };
        });
      } catch (error) {
        console.error("[UserStore] Set Primary Photo Action Error:", error);
        let errorMessage = "Failed to set primary photo.";
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    deletePhoto: async (photoId) => {
      set({ isLoading: true, error: null });
      try {
        await apiDeletePhoto(photoId);
        set(state => {
          if (!state.user) return {};
          const newPhotos = (state.user.photos || []).filter(photo => photo.id !== photoId);
          const newPhotoUrls = newPhotos.map(p => p.url);
          const newAvatarUrl = state.user.avatarUrl && state.user.avatarUrl === state.user.photos?.find(p => p.id === photoId)?.url 
                               ? null 
                               : state.user.avatarUrl;
          return {
            user: {
              ...state.user,
              photos: newPhotos,
              photoUrls: newPhotoUrls,
              avatarUrl: newAvatarUrl
            },
            isLoading: false
          };
        });
      } catch (error) {
        console.error("Delete Photo Error:", error);
        let errorMessage = "Failed to delete photo.";
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },
    
  }),
  {
    name: 'user-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ token: state.token }),
  }
));

// Initial fetch logic moved to App.tsx useEffect hook
// console.log("Initial call to fetchUserProfile (outside store setup)");
// useUserStore.getState().fetchUserProfile(); 