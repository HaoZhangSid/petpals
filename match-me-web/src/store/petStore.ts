import { create } from 'zustand';
import { api } from '../services/api';
import { Pet } from '../types';

interface PetState {
  pets: Pet[];
  activePet: Pet | null;
  isLoading: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  addPet: (pet: Omit<Pet, 'id' | 'userId'>) => Promise<void>;
  updatePet: (id: string, data: Partial<Pet>) => Promise<void>;
  setActivePet: (petId: string) => void;
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
      const { data } = await api.get('/pets');
      set({ 
        pets: data, 
        activePet: data.length > 0 ? data[0] : null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch pets', 
        isLoading: false 
      });
    }
  },
  
  addPet: async (pet) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/pets', pet);
      set((state) => ({ 
        pets: [...state.pets, data],
        activePet: state.pets.length === 0 ? data : state.activePet,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add pet', 
        isLoading: false 
      });
    }
  },
  
  updatePet: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updatedPet } = await api.patch(`/pets/${id}`, data);
      set((state) => ({ 
        pets: state.pets.map(pet => pet.id === id ? updatedPet : pet),
        activePet: state.activePet?.id === id ? updatedPet : state.activePet,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update pet', 
        isLoading: false 
      });
    }
  },
  
  setActivePet: (petId) => {
    const { pets } = get();
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      set({ activePet: pet });
    }
  },
  
  clearError: () => set({ error: null })
}));