import React, { useState, useEffect } from 'react';
import { usePetStore } from '../../store/petStore';
import { useUserStore } from '../../store/userStore';
import { Pet } from '../../types';
import PetProfileForm from './PetProfileForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MyPetsSectionProps {
  openAddPetModal: () => void;
  openLightbox: (index: number) => void;
}

// Define API base URL directly for now to avoid import.meta.env issues
const API_BASE_URL = 'http://localhost:8080';

const MyPetsSection: React.FC<MyPetsSectionProps> = ({ openAddPetModal, openLightbox }) => {
  // --- State and Store Logic ---
  const user = useUserStore(state => state.user);
  const isInitializing = useUserStore(state => state.isInitializing);
  const {
    pets,
    activePet,
    isLoading: isLoadingPets,
    error: petError,
    fetchPets,
    setActivePet,
    deletePet,
    updatePet,
  } = usePetStore();

  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitializing && user) {
      console.log("MyPetsSection mounted or user/init changed, fetching pets...");
      fetchPets();
    }
  }, [isInitializing, user, fetchPets]);

  // --- Event Handlers ---
  const handleStartEditPet = (petToEdit: Pet) => {
    setEditingPet(petToEdit);
  };

  const handleCancelEditPet = () => {
    setEditingPet(null);
  };

  const handleSavePetProfile = async (formData: FormData) => {
    const petId = editingPet?.id;
    if (!petId) {
      console.error("Cannot save pet profile: editingPet or its ID is null.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    try {
      await updatePet(petId, formData);
      setSaveSuccess("Pet profile updated successfully!");
      setEditingPet(null);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error("Failed to save pet profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewPet = () => {
    openAddPetModal();
  };

  const handleDeletePetConfirm = async (petId: string) => {
    setIsSaving(true);
    try {
      await deletePet(petId);
      setShowDeleteConfirm(null);
      if (activePet?.id === petId) {
          setActivePet(null);
      }
    } catch (error) {
      console.error("Failed to delete pet:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Rendering ---
  return (
    <>
      <h2 className="text-xl font-bold text-purple-700 mb-4">My Pets</h2>

      {/* ... (AnimatePresence for saveSuccess) ... */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-center"
          >
            <span className="mr-2">✅</span>
            {saveSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoadingPets && <div className="text-center py-4">Loading pets...</div>}
      {petError && <div className="text-center py-4 text-red-600">Error loading pets: {petError}</div>}

      {!isLoadingPets && (
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {Array.isArray(pets) && pets.map(pet => {
            const tabImageUrl = pet.avatarUrl?.startsWith('/uploads/')
                                ? `${API_BASE_URL}${pet.avatarUrl}`
                                : pet.avatarUrl || '/placeholder-pet.png';

            return (
              <button
                key={pet.id}
                onClick={() => setActivePet(pet.id)}
                className={`pet-tab rounded-xl bg-white p-3 border-2 shadow-sm flex items-center space-x-3 cursor-pointer flex-shrink-0 transition duration-150 ease-in-out ${activePet?.id === pet.id ? 'border-softpink' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <img
                  src={tabImageUrl}
                  alt={pet.name}
                  className={`w-12 h-12 rounded-full border-2 bg-gray-200 object-cover ${activePet?.id === pet.id ? 'border-softpink' : 'border-transparent'}`}
                  onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.src = '/placeholder-pet.png';
                     target.onerror = null;
                  }}
                />
                <div>
                  <p className={`font-semibold text-sm ${activePet?.id === pet.id ? 'text-purple-700' : 'text-gray-700'}`}>{pet.name}</p>
                  <p className="text-xs text-gray-500">{pet.type || 'Pet'} • {pet.breed || 'Breed not set'}</p>
                </div>
              </button>
            );
          })}
          <button
            className="pet-tab rounded-xl bg-white p-3 border-2 border-dashed border-gray-300 shadow-sm flex items-center justify-center space-x-2 cursor-pointer hover:bg-gray-50 hover:border-gray-400 flex-shrink-0 w-40 transition duration-150 ease-in-out"
            onClick={handleAddNewPet}
          >
            <span className="text-xl text-gray-400">+</span>
            <span className="font-medium text-sm text-gray-500">Add New Pet</span>
          </button>
        </div>
      )}

      {activePet ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Pet Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-700">{activePet.name}'s Profile</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartEditPet(activePet)}
                      className="text-skyblue hover:text-blue-600 text-lg"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(activePet.id)}
                      className="text-red-500 hover:text-red-600 text-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-center mb-6">
                  {(() => {
                    const profileImageUrl = activePet.avatarUrl?.startsWith('/uploads/')
                                          ? `${API_BASE_URL}${activePet.avatarUrl}`
                                          : activePet.avatarUrl || '/placeholder-pet.png';
                    return (
                      <img
                        src={profileImageUrl}
                        alt={activePet.name}
                        className="w-32 h-32 rounded-full mx-auto mb-3 border-4 border-softpink bg-gray-200 object-cover"
                        onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.src = '/placeholder-pet.png';
                           target.onerror = null;
                        }}
                      />
                    );
                  })()}
                  <h3 className="font-bold text-lg text-purple-700">{activePet.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {activePet.type || 'Pet'} • {activePet.breed || 'Breed not set'}
                  </p>
                </div>
                <div className="border-t border-gray-100 p-6 space-y-3">
                  <p><strong>Type:</strong> {activePet.type}</p>
                  <p><strong>Breed:</strong> {activePet.breed || <span className="text-gray-400">Not Set</span>}</p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender:</span>
                    <span className="font-medium text-gray-800 capitalize">{activePet.gender || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weight:</span>
                    <span className="font-medium text-gray-800">{activePet.weight ? `${activePet.weight} lbs` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Birthday:</span>
                    <span className="font-medium text-gray-800">{activePet.birthday ? new Date(activePet.birthday).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Microchipped:</span>
                    <span className={`font-medium ${activePet.isMicrochipped ? 'text-green-600' : 'text-gray-500'}`}>{activePet.isMicrochipped ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vaccinated:</span>
                    <span className={`font-medium ${activePet.isVaccinated ? 'text-green-600' : 'text-gray-500'}`}>{activePet.isVaccinated ? 'Up to date' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Neutered/Spayed:</span>
                    <span className={`font-medium ${activePet.isNeutered ? 'text-green-600' : 'text-gray-500'}`}>{activePet.isNeutered ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">Personality</h3>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(activePet.personality) && activePet.personality.length > 0 ? (
                    activePet.personality.map((trait, index) => (
                      <span key={index} className="bg-lavender bg-opacity-30 text-purple-700 text-xs px-2 py-1 rounded-full">{trait}</span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No personality traits added.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-700">Favorite Activities</h2>
                  <button
                    onClick={() => handleStartEditPet(activePet)}
                    className="text-skyblue hover:text-blue-600 text-lg"
                  >
                    ✏️
                  </button>
                </div>
                {activePet.favoriteActivities && activePet.favoriteActivities.length > 0 ? (
                  <div className="space-y-3">
                    {activePet.favoriteActivities.slice(0, 3).map((activity, index) => {
                      return (
                        <div key={index} className="bg-lavender bg-opacity-30 text-purple-700 text-xs px-2 py-1 rounded-full">{activity}</div>
                      );
                    })}
                    {activePet.favoriteActivities.length > 3 && (
                      <button className="w-full text-center py-2 text-sm text-skyblue hover:text-blue-600 transition">
                        + {activePet.favoriteActivities.length - 3} more activities
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center">
                    <div className="text-gray-300 text-5xl mb-4">🐾</div>
                    <p className="text-gray-500 text-sm text-center mb-4">No activities added yet</p>
                    <button
                      onClick={() => handleStartEditPet(activePet)}
                      className="px-4 py-1.5 bg-softpink text-white rounded-full text-sm hover:bg-pink-400 transition"
                    >
                      Add Activities
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: About and Photos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-700">About {activePet.name}</h2>
                <button
                  onClick={() => handleStartEditPet(activePet)}
                  className="text-skyblue hover:text-blue-600 text-lg"
                >
                  ✏️
                </button>
              </div>
              {activePet.bio ? (
                <p className="text-gray-700 text-sm">
                  {activePet.bio}
                </p>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-sm text-center mb-3">No bio added yet for this pet.</p>
                  <button
                    onClick={() => handleStartEditPet(activePet)}
                    className="px-4 py-1.5 bg-lavender bg-opacity-10 text-purple-700 rounded-full text-xs hover:bg-opacity-25 transition"
                  >
                    + Add Bio
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-purple-700 mb-4">{activePet.name}'s Photos</h2>
              {/* Use optional chaining and photoUrls for now */}
              {(activePet.photoUrls?.length || 0) > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                   {/* Map over photoUrls with type annotations */}
                  {activePet.photoUrls?.map((url: string, index: number) => {
                    const fullUrl = url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
                        return (
                          <div
                        key={index} // Use index as key for now
                        className="gallery-item overflow-hidden rounded-xl shadow-sm cursor-pointer aspect-square"
                        // Temporarily disable lightbox for pet photos until data structure is confirmed
                        // onClick={() => openLightbox(/* Needs adjustment */ index)} 
                           >
                            <img
                          src={fullUrl}
                              alt={`${activePet.name} photo ${index + 1}`}
                          className="w-full h-full object-cover hover:opacity-90 transition duration-300 bg-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-pet.png'; }}
                            />
                          </div>
                        );
                      })}
                    </div>
              ) : (
                <p className="text-sm text-gray-500">No photos uploaded for {activePet.name} yet.</p>
                    )}
              {/* TODO: Add Upload button for pet photos, link to POST /me/pets/{petId}/photos */}
                    <button
                 onClick={() => alert('Pet photo upload not implemented yet.')}
                 className="mt-4 w-full text-center py-2 text-sm text-skyblue hover:text-blue-600 transition"
                    >
                Upload Pet Photos (TODO)
                    </button>
            </div>
          </div>
        </div>
      ) : (
        !isLoadingPets && Array.isArray(pets) && pets.length > 0 && <div className="text-center py-8 text-gray-500">Select a pet to view details.</div>
      )}

      {!isLoadingPets && Array.isArray(pets) && pets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
              <p className="text-gray-500 mb-4">You haven't added any pets yet.</p>
              <button className="paw-btn bg-softpink text-white" onClick={handleAddNewPet}>Add Your First Pet</button>
          </div>
      )}

      {/* Modals related to pet editing/deleting */}
      <AnimatePresence>
        {editingPet && ( <PetProfileForm pet={editingPet} mode="edit" onSubmit={handleSavePetProfile} onCancel={handleCancelEditPet} /> )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Pet</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this pet? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePetConfirm(showDeleteConfirm)}
                  disabled={isSaving}
                  className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>
        {`.hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }`}
      </style>
    </>
  );
};

export default MyPetsSection; 