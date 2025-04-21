import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { api } from '../services/api';
import { User, LoginCredentials } from '../types';

interface UserState {
  fetchProfile: () => Promise<void>;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
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
        isInitializing: true,
        error: null,
        token: null,
        
        fetchProfile: async () => {
          // This is likely deprecated, use fetchUserProfile instead
          console.warn("fetchProfile called, ensure it's still needed or use fetchUserProfile");
          await get().fetchUserProfile(); // Delegate to the correct function
        },
        
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post('/auth/login', credentials);
            const { user, token } = response.data;
            if (!user || !token) {
              throw new Error('Invalid response from server');
            }
            // Interceptor handles token header
            // Set user, token, mark as authenticated, stop loading AND initialization
            set({ user: user, token: token, isLoading: false, isAuthenticated: true, isInitializing: false, error: null });
          } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Login failed. Please check credentials.';
            console.error('Login error:', err.response || err);
            delete api.defaults.headers.common['Authorization']; // Ensure header removed
            set({ error: errorMessage, isLoading: false, user: null, token: null, isAuthenticated: false, isInitializing: false }); // Stop initializing on login fail too
          }
        },
        
        logout: () => {
          localStorage.removeItem('user-storage'); // Explicit removal
          delete api.defaults.headers.common['Authorization'];
          // Reset state, including setting isInitializing to false (no longer initializing)
          set({ user: null, token: null, error: null, isAuthenticated: false, isLoading: false, isInitializing: false });
        },
        
        updateProfile: async (data: Partial<User>) => {
          // This might be deprecated, use updateUserProfile instead
          console.warn("updateProfile called, ensure endpoint is protected and correct (/api/v1/users/me?)");
          await get().updateUserProfile(data);
        },
        
        clearError: () => set({ error: null }),

        fetchUserProfile: async () => {
          // This function is called by initializeAuth if token exists
          const token = get().token;
          if (!token) {
            // This case should ideally be handled by initializeAuth before calling this,
            // but as a safeguard, stop initializing if no token.
            set({ isInitializing: false, isAuthenticated: false, user: null, token: null });
            return;
          }
          // Keep isLoading for this specific action if needed, but isInitializing is the key here
          set({ isLoading: true, error: null }); // Might set isLoading: true here
          try {
            const response = await api.get('/api/v1/me');
            const fetchedUser = response.data as User; 

            if (fetchedUser && fetchedUser.id) { 
                console.log("Successfully fetched user profile:", fetchedUser);
                // Set user, mark authenticated, stop initializing
                set({ user: fetchedUser, isLoading: false, isAuthenticated: true, isInitializing: false, error: null });
            } else {
                 console.error("Failed to get valid user data from /api/v1/me response:", response.data);
                 // Failed to get user, stop initializing, mark unauthenticated
                 set({ isLoading: false, isAuthenticated: false, user: null, isInitializing: false, error: "Failed to retrieve valid profile data." });
                 // Optional: Logout fully?
                 // get().logout(); 
            }
          } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to fetch user profile';
            console.error('Fetch user profile error:', err.response || err);
            // Error fetching profile (token expired, server error etc.), log out
            get().logout(); // logout sets isInitializing to false
            // Preserve the specific error message after logout resets it
            set(state => ({ ...state, error: errorMessage })); 
          }
        },
        
        updateUserProfile: async (profileData: Partial<User>) => {
           console.warn("updateUserProfile called, ensure endpoint is protected: /api/v1/users/me?");
           const token = get().token;
           if (!token || !get().user) return; // Need token and existing user data
           set({ isLoading: true, error: null });
           try {
             // Assuming PATCH /api/v1/me updates and returns the updated user
             const response = await api.patch('/api/v1/me', profileData); 
             const updatedUser = response.data as User;
             if (updatedUser && updatedUser.id) {
               set({ user: updatedUser, isLoading: false }); // Update user state with response
             } else {
               console.error("Invalid response from PATCH /api/v1/me", response.data);
               set({ isLoading: false, error: "Failed to update profile (invalid response)." });
             }
           } catch (err: any) {
             const errorMessage = err.response?.data?.error || 'Failed to update profile';
             console.error('Update profile error:', err.response || err);
             set({ error: errorMessage, isLoading: false });
           }
        }
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ token: state.token }), // Only persist token
        // onRehydrateStorage might be needed if we want to set isInitializing=true
        // *only* when rehydrating from storage, but default true should work.
      }
    )
  )
);

// Function to initialize auth state on app load
export const initializeAuth = () => {
  // Set initializing flag at the very start
  useUserStore.setState({ isInitializing: true });
  
  // Zustand's persist middleware should have rehydrated the token by now
  const token = useUserStore.getState().token;
  
  if (token) {
    // Interceptor handles adding token to requests
    console.log("Token found on init, attempting to fetch user profile.");
    // Attempt to fetch user profile (this will set isInitializing to false on completion/error)
    useUserStore.getState().fetchUserProfile();
  } else {
    console.log("No token found on init.");
    // No token, so initialization is done, ensure clean state
    delete api.defaults.headers.common['Authorization']; // Just in case
    useUserStore.setState({ user: null, isAuthenticated: false, token: null, isLoading: false, error: null, isInitializing: false });
  }
};

// Call initializeAuth when the app loads (e.g., in your main App component or index.tsx)