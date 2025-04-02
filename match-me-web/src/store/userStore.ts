import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { api } from '../services/api';
import { User, LoginCredentials } from '../types';

interface UserState {
  fetchProfile: () => Promise<void>;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  token: string | null;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
        
        fetchProfile: async () => {
          set({ isLoading: true, error: null });
          try {
            const { data } = await api.get('/users/profile');
            set({ user: data, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch profile', 
              isLoading: false 
            });
          }
        },
        
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post('/api/auth/login', credentials);
            const { user, token } = response.data;
            // Update user with more comprehensive mock profile data
            const fullUser: User = {
                ...user, // Assuming login returns basic user info like id, email, name
                avatar: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80', // Mock avatar
                location: 'San Francisco, CA',
                phone: '123-456-7890', // Added mock phone
                bio: 'Passionate pet lover living in SF. Working as a graphic designer. Enjoy hiking, photography, and spending quality time with my furry companions.',
                interests: ['Hiking', 'Photography', 'Art & Design', 'Crafting', 'Dog Training', 'Local Meetups'], // Added more interests
                createdAt: '2021-06-15T10:00:00Z' 
            };
            set({ user: fullUser, token, isLoading: false, isAuthenticated: true }); // Set isAuthenticated
            // Set authorization header for subsequent API calls
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            console.error('Login error:', err);
            set({ error: errorMessage, isLoading: false });
          }
        },
        
        logout: () => {
          set({ user: null, token: null, error: null, isAuthenticated: false }); // Set isAuthenticated to false
          // Remove authorization header
          delete api.defaults.headers.common['Authorization'];
          // Consider clearing other potentially related stores
        },
        
        updateProfile: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const { data: userData } = await api.patch('/users/profile', data);
            set({ user: userData, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Update failed', 
              isLoading: false 
            });
          }
        },
        
        clearError: () => set({ error: null }),

        // Example: Fetch user profile if not fully loaded on login
        fetchUserProfile: async () => {
          const token = get().token;
          if (!token) return; // Or handle error
          set({ isLoading: true, error: null });
          try {
             // Assuming an endpoint like /api/users/me
            const response = await api.get('/api/users/me'); 
            // Enhance the fetched user data with mock details if needed (or ensure backend provides all)
            const fetchedUser: User = {
                ...response.data, 
                // If backend doesn't return everything, add defaults here
                avatar: response.data.avatar || 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
                location: response.data.location || 'San Francisco, CA',
                phone: response.data.phone || '123-456-7890',
                bio: response.data.bio || 'Passionate pet lover living in SF. Working as a graphic designer. Enjoy hiking, photography, and spending quality time with my furry companions.',
                interests: response.data.interests || ['Hiking', 'Photography', 'Art & Design', 'Crafting', 'Dog Training', 'Local Meetups'],
                createdAt: response.data.createdAt || '2021-06-15T10:00:00Z' 
            };
            set({ user: fetchedUser, isLoading: false, isAuthenticated: true }); // Ensure isAuthenticated is true
          } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch profile';
            console.error('Fetch profile error:', err);
            // If profile fetch fails, maybe log out or clear token?
            set({ error: errorMessage, isLoading: false, isAuthenticated: false, user: null, token: null });
            delete api.defaults.headers.common['Authorization'];
          }
        },
        
        // Example: Update user profile
        updateUserProfile: async (profileData: Partial<User>) => {
           const token = get().token;
           if (!token || !get().user) return; // Or handle error
           set({ isLoading: true, error: null });
           try {
             // Assuming an endpoint like /api/users/me
             const response = await api.patch('/api/users/me', profileData);
             set({ user: response.data, isLoading: false }); 
           } catch (err: any) {
             const errorMessage = err.response?.data?.message || 'Failed to update profile';
             console.error('Update profile error:', err);
             set({ error: errorMessage, isLoading: false });
           }
        }
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ token: state.token }),
      }
    )
  )
);

// Rehydrate token on initial load if needed (might be handled by persist middleware)
const initialToken = (useUserStore.getState() as UserState).token;
if (initialToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}