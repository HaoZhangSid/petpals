import React, { useState, useEffect } from 'react';
import { User, Photo } from '../../types';
import { useUserStore } from '../../store/userStore';
import { 
  HeartIcon, 
  TrashIcon, 
  PencilIcon 
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/outline';
import Lightbox from '../common/Lightbox';
import { toast } from 'react-hot-toast';

// Re-introduce Props to receive the edit handler
interface UserPhotosSectionProps {
  // Remove user prop - component gets it from store
  // user: User;
  onStartEdit: () => void;
}

// Define API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helper component for individual photo item
interface PhotoItemProps {
  photo: { id: string; url: string; isPrimary?: boolean };
  user: { name?: string; avatarUrl?: string | null };
  index: number;
  openLightbox: (index: number) => void;
  isLoading: boolean;
  setPrimaryPhoto: (id: string) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ 
  photo, 
  user, 
  index, 
  openLightbox, 
  isLoading,
  setPrimaryPhoto, 
  deletePhoto 
}) => {
  const [isItemLoading, setIsItemLoading] = useState(false);
  
  const photoId = photo.id;

  const getFullUrl = (url: string | null | undefined): string | null => {
      if (!url) return null;
    return url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
  }

  const fullUrl = getFullUrl(photo.url);
  const isAvatar = user.avatarUrl ? getFullUrl(user.avatarUrl) === fullUrl : false;

  const handleSetPrimary = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isItemLoading || isLoading) return;
    setIsItemLoading(true);
    try {
      await setPrimaryPhoto(id);
      toast.success('Avatar set successfully!');
    } catch (error) {
      console.error("Set Primary Error:", error);
      toast.error(`Failed to set avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsItemLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isItemLoading || isLoading) return;
    if (confirm('Are you sure you want to delete this photo?')) {
       setIsItemLoading(true);
      try {
        await deletePhoto(id);
        toast.success('Photo deleted successfully!');
      } catch (error) {
        console.error("Delete Error:", error);
        toast.error(`Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
         setIsItemLoading(false);
      }
    }
  };

  const isActionInProgress = isLoading || isItemLoading;

  return (
    <div
      key={photo.id} 
      className={`gallery-item overflow-hidden rounded-xl shadow-sm group relative ${index === 0 ? 'col-span-2 row-span-2' : 'aspect-square'} cursor-pointer`}
      onClick={() => {
        console.log(`[PhotoItem Click] index: ${index}, isActionInProgress: ${isActionInProgress}, isLoading (global): ${isLoading}, isItemLoading (local): ${isItemLoading}`);
        if (!isActionInProgress) {
           console.log(`[UserPhotosSection] Outer div clicked, index: ${index}. Calling openLightbox.`);
           openLightbox(index);
        }
      }}
    >
      <img
        src={getFullUrl(photo.url) ?? undefined}
        alt={`${user.name ?? 'User'} photo ${index + 1}`}
        className="w-full h-full object-cover bg-gray-200"
        onError={(e) => { (e.target as HTMLImageElement).src = '/'; }}
      />
      {/* --- Restore Overlay --- */}
      
      <div 
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-start justify-end p-1 space-x-1 opacity-0 group-hover:opacity-100"
      >
        {!isAvatar && (
          <button
            onClick={(e) => handleSetPrimary(e, photoId)}
            disabled={isActionInProgress}
            className="p-1 bg-white text-purple-600 rounded-full shadow-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title="Set as Avatar"
          >
            {isItemLoading ? (
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <HeartIcon className="h-4 w-4" /> 
            )}
          </button>
        )}
              <button
          onClick={(e) => handleDelete(e, photoId)}
          disabled={isActionInProgress}
          className="p-1 bg-white text-red-600 rounded-full shadow-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Delete Photo"
        >
          {isItemLoading ? (
             <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <TrashIcon className="h-4 w-4" /> 
          )}
            </button>
         {isAvatar && (
            <span className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow">Avatar</span>
        )}
      </div>
      
    </div>
  );
};

const UserPhotosSection: React.FC<UserPhotosSectionProps> = ({ onStartEdit }) => {
  // Access store state and actions
  const user = useUserStore(state => state.user);
  const photos = useUserStore(state => state.user?.photos) || [];
  const setPrimaryPhoto = useUserStore(state => state.setPrimaryPhoto);
  const deletePhoto = useUserStore(state => state.deletePhoto);
  const isLoading = useUserStore(state => state.isLoading);

  // Keep lightbox state and handlers internal to this component
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const openLightbox = (index: number) => {
    console.log(`[UserPhotosSection] openLightbox called with index: ${index}`);
    setLightboxStartIndex(index);
    setLightboxOpen(true);
    console.log("Lightbox state after open:", { lightboxOpen: true, lightboxStartIndex: index });
  };

  const closeLightbox = () => {
    console.log("[UserPhotosSection] closeLightbox called");
    setLightboxOpen(false);
    console.log("Lightbox state after close:", { lightboxOpen: false });
  };

  // Prepare photos data for Lightbox (needs id and url)
  const lightboxPhotos = photos.map(p => ({ id: p.id, url: p.url }));

  if (!user) {
    return <div className="text-center p-4">Loading user data...</div>; 
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
      {/* Header with Title and Edit Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Photos ({photos.length})</h3>
        <button 
          onClick={onStartEdit} 
          className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
          title="Add/Edit Photos"
        >
           <PencilIcon className="h-5 w-5" />
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-500">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {photos.map((photo, index) => (
            <PhotoItem 
              key={photo.id}
              photo={photo}
              user={user}
              index={index}
              openLightbox={openLightbox}
              isLoading={isLoading}
              setPrimaryPhoto={setPrimaryPhoto}
              deletePhoto={deletePhoto}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox 
          photos={lightboxPhotos} 
          startIndex={lightboxStartIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
};

export default UserPhotosSection; 