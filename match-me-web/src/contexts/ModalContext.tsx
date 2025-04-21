import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Pet } from '../types';
import PetProfileForm from '../components/profile/PetProfileForm';
import { usePetStore } from '../store/petStore';
import { api } from '../services/api';

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
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const addPetToStore = usePetStore(state => state.addPet);
  
  const openAddPetModal = () => setIsAddPetModalOpen(true);
  const closeAddPetModal = () => setIsAddPetModalOpen(false);
  
  // Update the function signature to accept FormData directly
  const handleAddPet = async (formData: FormData) => {
    console.log("FormData received by handleAddPet in ModalContext:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      // Send the received FormData directly using api.post
      const response = await api.post('/api/v1/pets', formData, {
          headers: {
            // Axios usually sets this automatically for FormData
            'Content-Type': 'multipart/form-data',
          },
      });

      const createdPet: Pet = response.data;
      console.log('>>> Pet created successfully (API Response):', createdPet); // <--- 添加这行日志

      if (addPetToStore) {
        addPetToStore(createdPet);
      }
      closeAddPetModal();

    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || 'Network Error';
      // Log the full error for more details
      console.error('Failed to add pet:', error.response || error);
      alert(`Failed to add pet: ${errMsg}`);
    }
  };
  
  return (
    <ModalContext.Provider
      value={{
        isAddPetModalOpen,
        openAddPetModal,
        closeAddPetModal,
      }}
    >
      {children}
      
      {/* 使用PetProfileForm替代AddPetModal */}
      {isAddPetModalOpen && (
        <PetProfileForm 
          mode="create"
          onSubmit={handleAddPet}
          onCancel={closeAddPetModal}
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