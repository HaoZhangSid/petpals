import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Import Photo type
import { Photo } from '../../types'; 
// Import store actions (alternative to passing handlers as props)
import { useUserStore } from '../../store/userStore';
// Import icons for buttons
import { HeartIcon, TrashIcon, ArrowLeftCircleIcon, ArrowRightCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Use outline icons for actions?
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast'; // Import toast

interface LightboxProps {
  // Change images prop to accept Photo objects (or at least id and url)
  // photos: Photo[]; 
  photos: Array<{ id: string; url: string; isPrimary?: boolean }>; // Accept array with id and url, optionally isPrimary
  startIndex?: number; 
  onClose: () => void; 
  // Remove action handlers as props if using store directly
  // onSetPrimary?: (photoId: string) => Promise<void>;
  // onDelete?: (photoId: string) => Promise<void>;
}

// Define API_BASE_URL for constructing potential full URLs if needed for comparison
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Lightbox: React.FC<LightboxProps> = ({ photos, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isImageLoading, setIsImageLoading] = useState(true); // Start loading initially

  // Access store actions directly
  const setPrimaryPhoto = useUserStore(state => state.setPrimaryPhoto);
  const deletePhoto = useUserStore(state => state.deletePhoto);
  const isLoading = useUserStore(state => state.isLoading);
  const userAvatarUrl = useUserStore(state => state.user?.avatarUrl); // Get avatarUrl from store

  // Helper to get full URL if needed (especially for comparison)
  const getFullUrl = (url: string | null | undefined): string | null => {
      if (!url) return null;
      return url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
  }

  const currentPhoto = photos[currentIndex];
  // Recalculate isCurrentAvatar based on store's userAvatarUrl and current photo url
  const isCurrentAvatar = !!userAvatarUrl && getFullUrl(userAvatarUrl) === getFullUrl(currentPhoto?.url);

  // --- Navigation Handlers --- 
  const gotoPrevious = useCallback(() => {
    setIsImageLoading(true); // Start loading before changing index
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  }, [photos.length]);

  const gotoNext = useCallback(() => {
    setIsImageLoading(true); // Start loading before changing index
    setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
  }, [photos.length]);
  
  // Reset loading state when currentIndex changes (new image starts loading)
  useEffect(() => {
      setIsImageLoading(true);
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        gotoPrevious();
      } else if (e.key === 'ArrowRight') {
        gotoNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gotoPrevious, gotoNext, onClose]);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // --- Action Handlers for Lightbox Buttons --- 
  const handleSetPrimaryClick = async () => {
    const currentPhoto = photos[currentIndex];
    if (currentPhoto && currentPhoto.id && !isLoading) {
      try {
        await setPrimaryPhoto(currentPhoto.id);
        toast.success('Avatar updated successfully!'); // Use toast success
        // Maybe close lightbox after setting primary? Or show success?
        // onClose(); 
      } catch (error) {
        console.error("Lightbox: Failed to set primary photo:", error);
        // Use toast error, provide more context if possible
        toast.error(`Failed to set avatar: ${error instanceof Error ? error.message : 'Unknown error'}`); 
      }
    }
  };

  const handleDeleteClick = async () => {
    const currentPhoto = photos[currentIndex];
    if (currentPhoto && currentPhoto.id && !isLoading) {
      // Use a more subtle confirmation if needed, or directly proceed
      if (confirm('Are you sure you want to delete this photo?')) { 
        try {
          await deletePhoto(currentPhoto.id);
          toast.success('Photo deleted successfully!'); // Use toast success
          // Decide what to do after delete: Close or navigate?
          setIsImageLoading(true); // Set loading true before potential index change
          if (photos.length <= 1) {
            onClose(); // Close if it was the last photo
          } else {
            // Go to the previous image (adjusting index carefully)
            const newIndex = Math.max(0, currentIndex - 1);
            setCurrentIndex(newIndex);
            // We rely on the store update to eventually remove the image data
            // For immediate UI, we could manually filter `photos` state here, but it gets complex
          }
        } catch (error) {
          console.error("Lightbox: Failed to delete photo:", error);
          // Use toast error
          toast.error(`Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`); 
        }
      }
    }
  };

  if (!photos || photos.length === 0 || !currentPhoto) {
    return null; // Don't render if no photos or currentPhoto is undefined
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose} // Close on clicking the background
      >
        {/* Close Button - Using XMarkIcon */}
        <button
          className="absolute top-5 right-5 text-white opacity-70 hover:opacity-100 z-50"
          onClick={(e) => {
            e.stopPropagation(); // Prevent background click
            onClose();
          }}
          aria-label="Close lightbox"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Previous Button - Adjusted Style */}
        {photos.length > 1 && (
          <button
            className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-white opacity-60 hover:opacity-100 z-50 p-2 rounded-full focus:outline-none"
            onClick={(e) => { e.stopPropagation(); gotoPrevious(); }}
            aria-label="Previous image"
          >
            <ArrowLeftCircleIcon className="h-10 w-10 sm:h-12 sm:w-12" />
          </button>
        )}

        {/* Next Button - Adjusted Style */}
        {photos.length > 1 && (
          <button
            className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-white opacity-60 hover:opacity-100 z-50 p-2 rounded-full focus:outline-none"
            onClick={(e) => { e.stopPropagation(); gotoNext(); }}
            aria-label="Next image"
          >
            <ArrowRightCircleIcon className="h-10 w-10 sm:h-12 sm:w-12" />
          </button>
        )}

        {/* Main Content Area */} 
        <motion.div
          key={currentIndex} 
          initial={{ opacity: 0, scale: 0.95 }} // Add subtle animation
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-full max-h-full flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()} 
        >
          {/* Image Container with Loading State */}
          <div className="relative mb-4 w-full flex justify-center items-center max-h-[80vh]">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {/* Simple Spinner */} 
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={getFullUrl(currentPhoto.url) ?? undefined}
              alt={`Image ${currentIndex + 1} of ${photos.length}`}
              className={`block max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsImageLoading(false)} // Set loading false when image loads
              onError={() => setIsImageLoading(false)} // Also handle error case
            />
          </div>
          {/* Action Buttons Below Image */} 
          {!isImageLoading && ( // Only show buttons when image is loaded
            <div className="flex space-x-4 p-2 bg-black bg-opacity-60 rounded-lg">
              {/* Set Primary Button */} 
              {!isCurrentAvatar && (
                  <button 
                    onClick={handleSetPrimaryClick}
                    disabled={isLoading}
                    className="flex items-center px-3 py-1 bg-white text-purple-700 rounded-md shadow hover:bg-purple-100 disabled:opacity-50 text-sm"
                    title="Set as Avatar"
                  >
                    <HeartIcon className="h-5 w-5 mr-1" />
                    Set Avatar
                  </button>
              )}
              {isCurrentAvatar && (
                  <span className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-md shadow text-sm">
                     <HeartSolidIcon className="h-5 w-5 mr-1" />
                     Current Avatar
                  </span>
              )}
              {/* Delete Button */} 
              <button 
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="flex items-center px-3 py-1 bg-white text-red-600 rounded-md shadow hover:bg-red-100 disabled:opacity-50 text-sm"
                title="Delete Photo"
              >
                <TrashIcon className="h-5 w-5 mr-1" />
                Delete
              </button>
            </div>
          )}
        </motion.div>

        {/* Counter */}
        {photos.length > 1 && (
           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
             {currentIndex + 1} / {photos.length}
           </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox; 