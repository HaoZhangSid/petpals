import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Pet } from '../types';
import PetProfileForm from '../components/profile/PetProfileForm';
import { usePetStore } from '../store/petStore';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

// Helper function to append data to FormData, handling null/undefined and booleans
const appendToFormData = (formData: FormData, key: string, value: any) => {
  if (value === null || value === undefined) {
    // Skip null or undefined values, backend should handle missing fields
    return; 
  }
  if (typeof value === 'boolean') {
    formData.append(key, value ? 'true' : 'false');
  } else if (Array.isArray(value)) {
    // TODO: Backend needs to support receiving array fields like this
    // For now, maybe join them into a comma-separated string or handle differently?
    // Option 1: Append each item (requires backend changes to parse fieldName[])
    // value.forEach(item => formData.append(`${key}[]`, String(item))); 
    // Option 2: Join into string (simpler for current backend, but needs parsing there)
    formData.append(key, value.join(',')); // Example: personality=friendly,playful
  } else {
    // Append strings, numbers directly
    formData.append(key, String(value)); 
  }
};

// Context types
interface ModalContextType {
  isAddPetModalOpen: boolean;
  openAddPetModal: () => void;
  closeAddPetModal: () => void;
  isEditPetModalOpen: boolean;
  editingPetData: Pet | null;
  openEditPetModal: (pet: Pet) => void;
  closeEditPetModal: () => void;
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isEditPetModalOpen, setIsEditPetModalOpen] = useState(false);
  const [editingPetData, setEditingPetData] = useState<Pet | null>(null);

  const addPetToStore = usePetStore(state => state.addPet);
  const updatePetInStore = usePetStore(state => state.updatePet);
  
  const openAddPetModal = () => setIsAddPetModalOpen(true);
  const closeAddPetModal = () => setIsAddPetModalOpen(false);
  
  const openEditPetModal = (pet: Pet) => {
    setEditingPetData(pet);
    setIsEditPetModalOpen(true);
  };
  const closeEditPetModal = () => {
    setIsEditPetModalOpen(false);
    setEditingPetData(null);
  };
  
  const handleAddPet = async (formData: FormData) => {
    console.log("FormData received by handleAddPet in ModalContext:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await api.post('/api/v1/me/pets', formData, { 
          headers: {
            'Content-Type': 'multipart/form-data',
          },
      });

      const createdPet: Pet = response.data;
      console.log('>>> Pet created successfully (API Response):', createdPet);

      if (addPetToStore) {
        addPetToStore(createdPet);
      }
      toast.success("Pet added successfully!");
      closeAddPetModal();

    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || 'Network Error';
      console.error('Failed to add pet:', error.response || error);
      toast.error(`Failed to add pet: ${errMsg}`);
    }
  };
  
  const handleUpdatePet = async (formData: FormData) => {
    if (!editingPetData || !editingPetData.id) {
      console.error("Cannot update pet: No pet data available for editing.");
      toast.error("An error occurred. Please try again.");
      return;
    }
    const petId = editingPetData.id;
    try {
      await updatePetInStore(petId, formData);
      toast.success("Pet profile updated successfully!");
      closeEditPetModal();
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || 'Network Error';
      console.error('Failed to update pet:', error.response || error);
      toast.error(`Failed to update pet: ${errMsg}`);
    }
  };
  
  return (
    <ModalContext.Provider
      value={{
        isAddPetModalOpen,
        openAddPetModal,
        closeAddPetModal,
        isEditPetModalOpen,
        editingPetData,
        openEditPetModal,
        closeEditPetModal,
      }}
    >
      {children}
      
      {isAddPetModalOpen && (
        <PetProfileForm 
          mode="create"
          onSubmit={handleAddPet}
          onCancel={closeAddPetModal}
        />
      )}
      
      {isEditPetModalOpen && editingPetData && (
        <PetProfileForm 
          mode="edit"
          pet={editingPetData}
          onSubmit={handleUpdatePet}
          onCancel={closeEditPetModal}
        />
      )}
    </ModalContext.Provider>
  );
};

// Custom hook for using the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 