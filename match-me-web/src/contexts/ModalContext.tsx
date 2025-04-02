import React, { createContext, useState, useContext, ReactNode } from 'react';
import AddPetModal from '../components/modals/AddPetModal';
import { Pet } from '../types';

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
  
  const openAddPetModal = () => setIsAddPetModalOpen(true);
  const closeAddPetModal = () => setIsAddPetModalOpen(false);
  
  // Handle pet added
  const handlePetAdded = (pet: Pet) => {
    // In a real app, you would update your global state or context here
    console.log('Pet added:', pet);
    
    // You might want to refetch pets data or trigger a state update in a pet context
    // For now, we just log and close the modal
    closeAddPetModal();
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
      
      {/* Modals */}
      <AddPetModal 
        isOpen={isAddPetModalOpen} 
        onClose={closeAddPetModal} 
        onPetAdded={handlePetAdded} 
      />
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