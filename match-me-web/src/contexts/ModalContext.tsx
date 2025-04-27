import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Pet, Photo } from '../types';
import PetProfileForm from '../components/profile/PetProfileForm';
import PetPhotosForm from '../components/pets/PetPhotosForm';
import { usePetStore } from '../store/petStore';
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

// Context Type - Simplified, remove handleAddPet/handleUpdatePet logic signs
interface ModalContextType {
  isAddPetModalOpen: boolean;
  openAddPetModal: () => void;
  closeAddPetModal: () => void;
  isEditPetModalOpen: boolean;
  editingPetData: Pet | null;
  openEditPetModal: (pet: Pet) => void;
  closeEditPetModal: () => void;
  isUploadPhotoModalOpen: boolean;
  uploadingPetId: string | null;
  openUploadPhotoModal: (petId: string) => void;
  closeUploadPhotoModal: () => void;
  // Add handleUploadPhotos here if PetPhotosForm needs it externally?
  // For now, assume PetPhotosForm calls store action directly or via onSuccess
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isEditPetModalOpen, setIsEditPetModalOpen] = useState(false);
  const [editingPetData, setEditingPetData] = useState<Pet | null>(null);
  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpen] = useState(false);
  const [uploadingPetId, setUploadingPetId] = useState<string | null>(null);
  
  // Get store actions
  const addPetToStore = usePetStore((state) => state.addPet);
  const updatePetInStore = usePetStore((state) => state.updatePet);

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
  
  const openUploadPhotoModal = (petId: string) => {
    setUploadingPetId(petId);
    setIsUploadPhotoModalOpen(true);
  };
  
  const closeUploadPhotoModal = () => {
    setIsUploadPhotoModalOpen(false);
    setUploadingPetId(null);
  };
  
  // Define the success handler for PetProfileForm
  const handlePetFormSuccess = (pet: Pet) => {
    if (isAddPetModalOpen) {
      addPetToStore(pet); // Add new pet to store
      console.log('New pet added to store:', pet);
    } else if (isEditPetModalOpen && editingPetData) {
      updatePetInStore(pet.id, pet); // Pass ID and pet data
      console.log('Pet updated in store:', pet);
    }
    // Note: Modal closing is handled by PetProfileForm's onCancel, called after onSuccess
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
        isUploadPhotoModalOpen,
        uploadingPetId,
        openUploadPhotoModal,
        closeUploadPhotoModal,
      }}
    >
      {children}
      
      {isAddPetModalOpen && (
        <PetProfileForm 
          mode="create"
          onCancel={closeAddPetModal}
          onSubmit={() => Promise.resolve()}
          onSuccess={handlePetFormSuccess}
        />
      )}
      
      {isEditPetModalOpen && editingPetData && (
        <PetProfileForm 
          mode="edit"
          pet={editingPetData}
          onCancel={closeEditPetModal}
          onSubmit={() => Promise.resolve()}
          onSuccess={handlePetFormSuccess}
        />
      )}
      
      {isUploadPhotoModalOpen && uploadingPetId && (
        <PetPhotosForm
          petId={uploadingPetId}
          onCancel={closeUploadPhotoModal}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 