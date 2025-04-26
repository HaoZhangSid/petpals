import React, { useState, useEffect, useRef } from 'react';
import { usePetStore } from '../../store/petStore';
import { useUserStore } from '../../store/userStore';
import { Pet } from '../../types';
import PetProfileForm from './PetProfileForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useModal } from '../../contexts/ModalContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MyPetsSectionProps {
  // Remove openAddPetModal prop, get from useModal hook instead
  // openAddPetModal: () => void;
  // Remove openLightbox prop - it wasn't used
  // openLightbox: (index: number) => void;
}

// Define API base URL directly for now to avoid import.meta.env issues
const API_BASE_URL = 'http://localhost:8080';

const MyPetsSection: React.FC = () => {
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
  } = usePetStore();

  // Get modal functions from context
  const { openAddPetModal, openEditPetModal } = useModal();

  // --- State for Active Pet Image --- 
  const [profileImageUrl, setProfileImageUrl] = useState('/placeholder-dog.png');

  // --- Ref to track if fetch has occurred ---
  const hasFetchedPets = useRef(false);

  // --- Effects ---
  useEffect(() => {
    // Log dependency values and fetch status on every run
    console.log(`[MyPetsSection useEffect Check] isInitializing=${isInitializing}, user exists=${!!user}, hasFetched=${hasFetchedPets.current}`);

    // Only fetch if condition is met AND we haven't fetched before
    if (!isInitializing && user && !hasFetchedPets.current) {
      console.log(`[MyPetsSection useEffect Action] Condition met AND first fetch! Running fetchPets.`);
      fetchPets();
      hasFetchedPets.current = true; // Set the flag to true after calling fetch
    }
  }, [isInitializing, user, fetchPets]); // Keep dependencies to run check when they change

  // Effect to update profileImageUrl when activePet changes
  useEffect(() => {
    if (activePet) {
      const url = activePet.avatarUrl?.startsWith('/uploads/')
        ? `${API_BASE_URL}${activePet.avatarUrl}`
        : activePet.avatarUrl;
      setProfileImageUrl(url || (activePet.type?.toLowerCase() === 'cat' ? '/placeholder-cat.png' : '/placeholder-dog.png'));
    } else {
      setProfileImageUrl('/placeholder-dog.png'); // Default if no active pet
    }
  }, [activePet]); // Dependency array includes activePet

  // --- Event Handlers ---
  // Remove handleStartEditPet, handleCancelEditPet, handleSavePetProfile

  // Use openAddPetModal directly from context
  const handleAddNewPet = () => {
    openAddPetModal();
  };

  // Revised delete handler using toast confirmation
  const handleDeletePet = (petToDelete: Pet) => {
    if (!petToDelete) return;

    toast((t) => (
      <div className="flex flex-col items-center p-2">
        <p className="mb-3 text-center text-sm font-medium">Delete {petToDelete.name}? This cannot be undone.</p>
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deletePet(petToDelete.id);
                toast.success(`${petToDelete.name} deleted successfully!`);
                // setActivePet is handled inside deletePet action in store
              } catch (error) {
                toast.error(`Failed to delete ${petToDelete.name}.`);
                console.error("Delete pet error:", error);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 font-semibold"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000, // Keep toast open longer for confirmation
    });
  };

  // --- Rendering ---
  return (
    <>
      <h2 className="text-xl font-bold text-purple-700 mb-4">My Pets</h2>

      {isLoadingPets && <div className="text-center py-4">Loading pets...</div>}
      {petError && <div className="text-center py-4 text-red-600">Error loading pets: {petError}</div>}

      {!isLoadingPets && (
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {Array.isArray(pets) && pets.map(pet => {
            const tabImageUrl = pet.avatarUrl?.startsWith('/uploads/')
                                ? `${API_BASE_URL}${pet.avatarUrl}`
                                : pet.avatarUrl || (pet.type?.toLowerCase() === 'cat' ? '/placeholder-cat.png' : '/placeholder-dog.png');

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
                     target.src = pet.type?.toLowerCase() === 'cat' ? '/placeholder-cat.png' : '/placeholder-dog.png';
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
                      // Update onClick to use openEditPetModal from context
                      onClick={() => openEditPetModal(activePet)} 
                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                      title="Edit Pet Profile"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      // Update onClick to call the new handleDeletePet
                      onClick={() => handleDeletePet(activePet)} 
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      title="Delete Pet"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <img
                    src={profileImageUrl}
                    alt={activePet.name}
                    className="w-32 h-32 rounded-full mx-auto mb-3 border-4 border-softpink bg-gray-200 object-cover"
                    onError={() => {
                       console.log(`Error loading ${profileImageUrl}, falling back to placeholder.`);
                       // Set state to the appropriate placeholder
                       setProfileImageUrl(activePet.type?.toLowerCase() === 'cat' ? '/placeholder-cat.png' : '/placeholder-dog.png');
                    }}
                  />
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
                    onClick={() => openEditPetModal(activePet)}
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
                      onClick={() => openEditPetModal(activePet)}
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
                  onClick={() => openEditPetModal(activePet)}
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
                    onClick={() => openEditPetModal(activePet)}
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

      {/* Remove the old AnimatePresence blocks for editingPet and showDeleteConfirm modals */}
      {/* These are now handled by ModalContext */}
      {/* <AnimatePresence> ... </AnimatePresence> */}
      {/* <AnimatePresence> ... </AnimatePresence> */}

      {/* Keep the style tag if needed */}
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