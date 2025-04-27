import React, { useState, useEffect, useMemo } from 'react';
import { Pet, Photo } from '../../types';
import { usePetStore } from '../../store/petStore';
import { useModal } from '../../contexts/ModalContext';
import {
    HeartIcon,
    TrashIcon,
    CheckCircleIcon,
    PlusIcon
} from '@heroicons/react/24/solid';
import Lightbox from '../common/Lightbox'; // Use the custom Lightbox again
import { toast } from 'react-hot-toast';

// Define API Base URL directly to avoid import.meta.env issues
const API_BASE_URL = 'http://localhost:8080'; 

// --- PetPhotoItem Component ---
interface PetPhotoItemProps {
    petId: string; // Pass petId down
    photo: Photo;
    petAvatarUrl: string | null | undefined;
    index: number; // Add index prop
    openLightbox: (index: number) => void; // Expect index
    isLoading: boolean;
    setPetAvatar: (petId: string, photoId: string) => Promise<void>;
    deletePetPhoto: (petId: string, photoId: string) => Promise<void>;
}

const PetPhotoItem: React.FC<PetPhotoItemProps> = ({ 
    petId, 
    photo, 
    petAvatarUrl, 
    index, 
    openLightbox, 
    isLoading, 
    setPetAvatar, 
    deletePetPhoto 
}) => {
    const isAvatar = photo.url === petAvatarUrl;
    // Construct full URL if it's a relative path from uploads
    const imageUrl = photo.url?.startsWith('/uploads/') ? `${API_BASE_URL}${photo.url}` : photo.url;

    const handleSetAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening lightbox
        if (isLoading || isAvatar) return;
        toast.promise(
            setPetAvatar(petId, photo.id),
            {
                loading: 'Setting as avatar...',
                success: 'Avatar updated successfully!',
                error: 'Failed to set avatar.',
            }
        );
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening lightbox
        if (isLoading) return;
        toast((t) => (
            <div className="flex flex-col items-center p-2">
                <p className="mb-3 text-center text-sm font-medium">Delete this photo? This cannot be undone.</p>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            toast.promise(
                                deletePetPhoto(petId, photo.id),
                                {
                                    loading: 'Deleting photo...',
                                    success: 'Photo deleted successfully!',
                                    error: 'Failed to delete photo.',
                                }
                            );
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
        ), { duration: 6000 });
    };

    return (
        <div 
            className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => openLightbox(index)} // Pass index on click
        >
            <img 
                src={imageUrl || '/placeholder-pet.png'} 
                alt={`Pet photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-pet.png'; }}
            />
            {/* Overlay for buttons */} 
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                    <button 
                        onClick={handleSetAvatarClick}
                        className={`p-2 rounded-full transition-colors duration-200 ${isAvatar ? 'bg-green-500 text-white cursor-default' : 'bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        title={isAvatar ? "Current Avatar" : "Set as Avatar"}
                        disabled={isLoading || isAvatar}
                    >
                        {isAvatar ? <CheckCircleIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
                    </button>
                    {!isAvatar && (
                         <button 
                            onClick={handleDeleteClick}
                            className="p-2 bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 hover:text-red-600 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Photo"
                            disabled={isLoading}
                         >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main PetPhotosSection ---
interface PetPhotosSectionProps {
    petId: string;
}

const PetPhotosSection: React.FC<PetPhotosSectionProps> = ({ petId }) => {
    // Select the specific pet object - Zustand handles reference equality here
    const pet = usePetStore(state => state.pets.find(p => p.id === petId));

    // Select actions (these are stable references)
    const setAvatar = usePetStore(state => state.setPetAvatar);
    const deletePhotoAction = usePetStore(state => state.deletePetPhoto);
    const isLoading = usePetStore(state => state.isLoading); 
    const { openUploadPhotoModal } = useModal();

    // Derive photos and avatarUrl from the selected pet object
    // Use empty array/null as fallbacks if pet is not found yet
    const photos = pet?.photos || [];
    const avatarUrl = pet?.avatarUrl;

    // Local state for lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0); 

    // Memoize the creation of lightboxPhotos
    const lightboxPhotos = useMemo(() => photos.map(p => ({
        id: p.id,
        url: p.url?.startsWith('/uploads/') ? `${API_BASE_URL}${p.url}` : p.url || '',
        isPrimary: p.url === avatarUrl
    })), [photos, avatarUrl]); // Only recalculate if photos array or avatarUrl changes

    const openLightbox = (index: number) => { 
        setLightboxStartIndex(index);
        setLightboxOpen(true);
    };

    const handleSetAvatar = async (photoId: string) => {
        if (isLoading) return;
         toast.promise(
            setAvatar(petId, photoId),
            {
                loading: 'Setting as avatar...',
                success: 'Avatar updated successfully!',
                error: 'Failed to set avatar.',
            }
        );
    };

    const handleDeletePhoto = async (photoId: string) => {
         if (isLoading) return;
         toast.promise(
            deletePhotoAction(petId, photoId),
            {
                loading: 'Deleting photo...',
                success: 'Photo deleted successfully!',
                error: 'Failed to delete photo.',
            }
        );
    };

    // Conditional rendering if pet data is not yet available
    if (!pet && !isLoading) {
        // Handle case where pet data isn't found (and not just loading)
        return <div className="text-center p-4 text-gray-500">Pet data not found...</div>;
    } // No need for explicit loading here if isLoading handles the main display below

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Photos</h3>
                <button
                    onClick={() => openUploadPhotoModal(petId)}
                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
                    title="Add Photos"
                    disabled={isLoading || !pet} // Disable if loading or pet not found
                >
                     <PlusIcon className="h-5 w-5" />
                </button>
            </div>

            {isLoading && <div className="text-center py-4 text-gray-500">Loading...</div>}

            {!isLoading && photos.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No photos uploaded yet.</p>
            )}

            {!isLoading && photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {photos.map((photo, index) => (
                        <PetPhotoItem
                            key={photo.id}
                            petId={petId}
                            photo={photo}
                            petAvatarUrl={avatarUrl} 
                            index={index} 
                            openLightbox={openLightbox} 
                            isLoading={isLoading}
                            setPetAvatar={setAvatar} 
                            deletePetPhoto={deletePhotoAction} 
                        />
                    ))}
                </div>
            )}

            {lightboxOpen && (
                <Lightbox
                    photos={lightboxPhotos} 
                    startIndex={lightboxStartIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
};

export default PetPhotosSection; 