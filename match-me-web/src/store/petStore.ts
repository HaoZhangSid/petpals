import { create } from 'zustand';
import { api } from '../services/api';
import { Pet } from '../types';

// Helper function (can be moved to utils)
const appendToFormData = (formData: FormData, key: string, value: any) => {
  if (value === null || value === undefined) return;
  if (typeof value === 'boolean') {
    formData.append(key, value ? 'true' : 'false');
  } else if (Array.isArray(value)) {
    formData.append(key, value.join(',')); // Simple join, backend needs parsing
  } else {
    formData.append(key, String(value));
  }
};

interface PetState {
  pets: Pet[];
  activePet: Pet | null;
  isLoading: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, formData: FormData) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  setActivePet: (petId: string | null) => void;
  clearError: () => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  activePet: null,
  isLoading: false,
  error: null,
  
  fetchPets: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/v1/me/pets');
      const fetchedPets: Pet[] = response.data;

      set({
        pets: fetchedPets,
        activePet: get().activePet ? fetchedPets.find(p => p.id === get().activePet?.id) ?? (fetchedPets[0] ?? null) : (fetchedPets[0] ?? null),
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch pets';
      console.error('Fetch pets error:', error.response || error);
      set({
        error: errorMessage,
        isLoading: false,
        pets: [],
        activePet: null
      });
    }
  },
  
  addPet: (createdPet: Pet) => {
    set((state) => ({
      pets: [...state.pets, createdPet],
      error: null
    }));
  },
  
  updatePet: async (id, formData) => {
    set({ isLoading: true, error: null });
    
    // Log the FormData being sent (for debugging)
    console.log("FormData being sent to updatePet store action:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      // Use the authenticated endpoint for updating user's pet
      const response = await api.put(`/api/v1/me/pets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      const updatedPet = response.data;
      set((state) => ({
        pets: state.pets.map(pet => pet.id === id ? updatedPet : pet),
        activePet: state.activePet?.id === id ? updatedPet : state.activePet,
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update pet';
      console.error('Update pet error:', error.response || error);
      set({
        error: errorMessage,
        isLoading: false
      });
       // Re-throw or handle the error appropriately so the caller knows
      throw error; 
    }
  },
  
  deletePet: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Use the authenticated endpoint for deleting user's pet
      await api.delete(`/api/v1/me/pets/${id}`);
      set((state) => ({
        pets: state.pets.filter(pet => pet.id !== id),
        activePet: state.activePet?.id === id ? (state.pets.find(p => p.id !== id) ?? null) : state.activePet, // Find next available pet or null
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete pet';
      console.error('Delete pet error:', error.response || error);
      set({
        error: errorMessage,
        isLoading: false
      });
       throw error;
    }
  },
  
  setActivePet: (petId: string | null) => {
    if (petId === null) {
      set({ activePet: null });
      return;
    }
    const { pets } = get();
    const pet = pets.find(p => p.id === petId);
    set({ activePet: pet || null });
  },
  
  clearError: () => set({ error: null })
}));