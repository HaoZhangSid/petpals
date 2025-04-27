import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
import { Pet } from '../types'; // Assuming Pet, Photo, User are in types/index.ts
// Import the new form
import PetPhotosForm from '../components/pets/PetPhotosForm';
// Import the existing pet profile form (assuming it's needed for ADD/EDIT)
import PetProfileForm from '../components/profile/PetProfileForm'; // Assuming path

// Re-add likely type definitions
export type ModalType = 'ADD_PET' | 'EDIT_PET' | 'DELETE_PET' | 'UPLOAD_PHOTO' | 'DELETE_PHOTO' | 'VIEW_MATCHES' | 'MESSAGE_USER' | 'REPORT_USER' | 'BLOCK_USER';

// Define possible shapes for modal data
type ModalData =
  | { pet: Pet } // For EDIT_PET
  | { petId: string } // For DELETE_PET, UPLOAD_PHOTO
  | null // For modals that don't need data like ADD_PET
  | any; // Fallback for other potential types (consider refining)

export interface ModalContextProps {
  modalType: ModalType | null;
  modalData: ModalData; // Use the defined type
  openModal: (type: ModalType, data?: ModalData) => void; // Update data type
  closeModal: () => void;
  isSubmitting: boolean;
  error: string | null;
  // Keep handler signatures as previously modified (accepting Partial<Pet>)
  handleAddPet: (petData: Partial<Pet>) => Promise<void>; 
  handleUpdatePet: (petId: string, petData: Partial<Pet>) => Promise<void>;
  handleDeletePet: (petId: string) => Promise<void>;
  // Add other handlers if they exist (e.g., for photos, messages etc.)
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<ModalData>(null); // Use ModalData type
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = (type: ModalType, data?: ModalData) => { // Update data type
    console.log(`Opening modal: ${type}`, data); // Add log
    setModalType(type);
    setModalData(data);
    setError(null);
  };

  const closeModal = () => {
    console.log("Closing modal"); // Add log
    setModalType(null);
    setModalData(null);
    setError(null);
    setIsSubmitting(false); // Ensure submitting state is reset
  };

  // --- Updated Add Pet Logic --- 
  const handleAddPet = useCallback(async (petData: Partial<Pet>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/me/pets', petData);
      console.log('Pet added successfully:', response.data);
      // Potentially trigger pet store fetch/add action here if needed
      closeModal();
    } catch (err: any) {
      console.error('Error adding pet:', err);
      const errorMessage = err.response?.data?.error || 'Failed to add pet. Please try again.';
      setError(errorMessage);
      // Re-throw or indicate failure to the form?
      // throw err; // Optionally re-throw if the form needs to know
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // --- Updated Update Pet Logic --- 
  const handleUpdatePet = useCallback(async (petId: string, petData: Partial<Pet>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.put(`/api/v1/me/pets/${petId}`, petData);
      console.log('Pet updated successfully:', response.data);
      // Potentially trigger pet store update action here if needed
      closeModal();
    } catch (err: any) {
      console.error('Error updating pet:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update pet. Please try again.';
      setError(errorMessage);
      // throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // --- Delete Pet Logic (remains the same) ---
  const handleDeletePet = useCallback(async (petId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
        await api.delete(`/api/v1/me/pets/${petId}`);
        console.log(`Pet ${petId} deleted successfully.`);
        // Potentially trigger pet store delete action here if needed
        closeModal();
    } catch (err: any) {
        console.error('Error deleting pet:', err);
        const errorMessage = err.response?.data?.error || 'Failed to delete pet. Please try again.';
        setError(errorMessage);
        throw err; // Re-throw so the confirmation modal knows deletion failed
    } finally {
        setIsSubmitting(false);
    }
  }, []);

  // Provide the context values (ensure 'value' object matches ModalContextProps)
  const value: ModalContextProps = {
    modalType,
    modalData,
    openModal,
    closeModal,
    isSubmitting,
    error,
    handleAddPet,
    handleUpdatePet,
    handleDeletePet,
  };

  // --- Render Logic --- (Added inside ModalProvider)
  const renderModalContent = () => {
    if (!modalType) return null;

    switch (modalType) {
      case 'ADD_PET':
        return (
          <PetProfileForm
            mode="create"
            onSubmit={handleAddPet}
            onCancel={closeModal}
          />
        );
      case 'EDIT_PET':
        if (modalData && typeof modalData === 'object' && 'pet' in modalData) {
          return (
            <PetProfileForm
              mode="edit"
              pet={modalData.pet}
              onSubmit={(data) => handleUpdatePet(modalData.pet.id, data)}
              onCancel={closeModal}
            />
          );
        }
        console.error("EDIT_PET modal opened without valid pet data:", modalData);
        return null;

      case 'DELETE_PET':
        if (modalData && typeof modalData === 'object' && 'petId' in modalData && modalData.petId) {
          return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                 <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                     <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                     <p className="text-gray-600 mb-6">Are you sure you want to delete this pet? This action cannot be undone.</p>
                     <div className="flex justify-end space-x-3">
                         <button onClick={closeModal} className="px-4 py-2 border rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                         <button
                            onClick={async () => {
                                try {
                                    await handleDeletePet(modalData.petId);
                                    // Success: closeModal is called inside handleDeletePet if it doesn't throw
                                } catch (e) {
                                    // Error state is set within handleDeletePet
                                    console.error("Delete pet failed (caught in UI)", e);
                                }
                            }}
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-red-600 text-white rounded-full text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                         >
                            {isSubmitting ? 'Deleting...' : 'Delete Pet'}
                         </button>
                     </div>
                     {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                 </div>
              </div>
          );
        }
         console.error("DELETE_PET modal opened without valid petId:", modalData);
         return null;

      case 'UPLOAD_PHOTO':
        if (modalData && typeof modalData === 'object' && 'petId' in modalData && modalData.petId) {
          return (
            <PetPhotosForm
              petId={modalData.petId}
              onCancel={closeModal}
            />
          );
        }
        console.error("UPLOAD_PHOTO modal opened without petId:", modalData);
        return null;

      // Add cases for other modal types

      default:
        console.warn(`Modal type "${modalType}" not handled.`);
        return null;
    }
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* Render the modal content outside the main children */} 
      {renderModalContent()}
    </ModalContext.Provider>
  );
};

// Custom hook remains the same
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 