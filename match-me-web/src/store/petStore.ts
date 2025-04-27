import { create } from 'zustand';
import { api } from '../services/api';
import { Pet, Photo } from '../types';

// Placeholder imports for API functions we'll define later
import {
  uploadPetPhotos as apiUploadPetPhotos,
  setPetAvatar as apiSetPetAvatar,
  deletePhoto as apiDeletePhoto // Reusing existing deletePhoto for now
} from '../services/api';

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
  isUploadingPhotos: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, petData: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  setActivePet: (petId: string | null) => void;
  clearError: () => void;
  uploadPetPhotos: (petId: string, formData: FormData) => Promise<void>;
  setPetAvatar: (petId: string, photoId: string) => Promise<void>;
  deletePetPhoto: (petId: string, photoId: string) => Promise<void>;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  activePet: null,
  isLoading: false,
  isUploadingPhotos: false,
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
      activePet: state.pets.length === 0 ? createdPet : state.activePet,
      error: null
    }));
  },
  
  updatePet: async (id, petData) => {
    set({ isLoading: true, error: null });
    
    console.log("Sending Pet Data (JSON object) to updatePet:", petData);

    try {
      const response = await api.put(`/api/v1/me/pets/${id}`, petData, {
         headers: {
          'Content-Type': 'application/json'
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
      throw error; 
    }
  },
  
  deletePet: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/me/pets/${id}`);
      set((state) => ({
        pets: state.pets.filter(pet => pet.id !== id),
        activePet: state.activePet?.id === id ? (state.pets.find(p => p.id !== id) ?? null) : state.activePet,
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
  
  clearError: () => set({ error: null }),

  uploadPetPhotos: async (petId, formData) => {
    set({ isUploadingPhotos: true, error: null });
    try {
      const uploadedPhotos = await apiUploadPetPhotos(petId, formData);
      set((state) => {
        const targetPetIndex = state.pets.findIndex(p => p.id === petId);
        if (targetPetIndex === -1) {
            console.warn(`[petStore] uploadPetPhotos: Pet with ID ${petId} not found in state.`);
            return { isUploadingPhotos: false };
        }

        const updatedPets = [...state.pets];
        const targetPet = { ...updatedPets[targetPetIndex] };
        const currentPhotos = targetPet.photos || [];

        targetPet.photos = [...currentPhotos, ...uploadedPhotos];
        targetPet.avatarUrl = uploadedPhotos.find(p => p.isPrimary)?.url ?? targetPet.avatarUrl;

        updatedPets[targetPetIndex] = targetPet;

        return {
          pets: updatedPets,
          activePet: state.activePet?.id === petId ? updatedPets[targetPetIndex] : state.activePet,
          isUploadingPhotos: false,
        };
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload pet photos';
      console.error(`Upload Pet Photos Error for pet ${petId}:`, error.response || error);
      set({ error: errorMessage, isUploadingPhotos: false });
      throw error;
    }
  },

  setPetAvatar: async (petId, photoId) => {
    set({ isLoading: true, error: null });
    try {
      await apiSetPetAvatar(photoId); 

      set((state) => {
        const targetPetIndex = state.pets.findIndex(p => p.id === petId);
        if (targetPetIndex === -1) {
            console.warn(`[petStore] setPetAvatar: Pet with ID ${petId} not found in state.`);
            return { isLoading: false };
        }

        const updatedPets = [...state.pets];
        const targetPet = { ...updatedPets[targetPetIndex] };
        let newAvatarUrl = targetPet.avatarUrl;
        let photoFound = false;

        targetPet.photos = (targetPet.photos || []).map((p: Photo) => {
          const isNowPrimary = (p.id === photoId);
          if (isNowPrimary) {
            photoFound = true;
            newAvatarUrl = p.url;
            return { ...p, isPrimary: true };
          }
          return { ...p, isPrimary: false }; 
        });
        
        if (!photoFound) {
            console.warn(`[petStore] setPetAvatar: Photo ID ${photoId} not found in pet ${petId}'s photos array after successful API call.`);
        }

        targetPet.avatarUrl = newAvatarUrl;
        updatedPets[targetPetIndex] = targetPet;

        return {
          pets: updatedPets,
          activePet: state.activePet?.id === petId ? updatedPets[targetPetIndex] : state.activePet,
          isLoading: false,
        };
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to set pet avatar';
      console.error(`Set Pet Avatar Error for photo ${photoId}:`, error.response || error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deletePetPhoto: async (petId, photoId) => {
    set({ isLoading: true, error: null });
    try {
      await apiDeletePhoto(photoId);

      set((state) => {
        const targetPetIndex = state.pets.findIndex(p => p.id === petId);
        if (targetPetIndex === -1) {
            console.warn(`[petStore] deletePetPhoto: Pet with ID ${petId} not found in state.`);
            return { isLoading: false };
        }

        const updatedPets = [...state.pets];
        const targetPet = { ...updatedPets[targetPetIndex] };
        const photoToDelete = (targetPet.photos || []).find(p => p.id === photoId);

        targetPet.photos = (targetPet.photos || []).filter(p => p.id !== photoId);

        if (photoToDelete && targetPet.avatarUrl === photoToDelete.url) {
          targetPet.avatarUrl = null;
        }

        updatedPets[targetPetIndex] = targetPet;

        return {
          pets: updatedPets,
          activePet: state.activePet?.id === petId ? updatedPets[targetPetIndex] : state.activePet,
          isLoading: false,
        };
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete pet photo';
      console.error(`Delete Pet Photo Error for photo ${photoId}:`, error.response || error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
}));