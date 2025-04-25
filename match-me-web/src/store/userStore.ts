import { create } from 'zustand';
import axios from 'axios';
import { api } from '../services/api';
import { User, LoginCredentials } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null, token: string | null) => void;
  clearUser: () => void;
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  registerUser: (userData: any) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (formData: FormData) => Promise<void>;
}

export const useUserStore = create<UserState>()(persist(
  (set, get) => ({
    user: null,
    token: null,
    isInitializing: true,
    isLoading: false,
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

    loginUser: async (credentials) => {
      set({ isLoading: true, error: null, isInitializing: false });
      try {
        const response = await api.post('/auth/login', credentials);
        const { token, user } = response.data; 
        get().setUser(user, token);
      } catch (error) {
        let errorMessage = "Login failed. Please check your credentials.";
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        console.error("Login Error:", error);
        set({ error: errorMessage, isLoading: false });
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
    
    updateUserProfile: async (formData: FormData) => {
      console.log("Attempting to update user profile via store...");
      const token = get().token;
      if (!token) {
        set({ error: 'Authentication required', isLoading: false });
        throw new Error('Authentication required');
      }
      set({ isLoading: true, error: null });
      try {
        const response = await api.patch('/api/v1/me', formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }); 
        const updatedUser = response.data as User;
        if (updatedUser && updatedUser.id) {
          console.log("User profile updated successfully in store:", updatedUser);
          set({ user: updatedUser, isLoading: false });
        } else {
          console.error("Update Profile Error: Invalid data received", response.data);
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