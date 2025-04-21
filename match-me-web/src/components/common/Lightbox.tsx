import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightboxProps {
  images: string[]; // Array of full image URLs
  startIndex?: number; // Index of the image to show initially
  onClose: () => void; // Function to call when closing the lightbox
}

const Lightbox: React.FC<LightboxProps> = ({ images, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const gotoPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const gotoNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

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

  if (!images || images.length === 0) {
    return null; // Don't render if no images
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
        onClick={onClose} // Close on clicking the background
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-white text-3xl z-50 hover:text-gray-300"
          onClick={(e) => {
            e.stopPropagation(); // Prevent background click
            onClose();
          }}
          aria-label="Close lightbox"
        >
          &times;
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-50 p-2 bg-black bg-opacity-30 rounded-full hover:bg-opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              gotoPrevious();
            }}
            aria-label="Previous image"
          >
            &#8249;
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-50 p-2 bg-black bg-opacity-30 rounded-full hover:bg-opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              gotoNext();
            }}
            aria-label="Next image"
          >
            &#8250;
          </button>
        )}

        {/* Image Display Area - Remove animation props */}
        <motion.div
          key={currentIndex} // Keep key for React reconciliation if needed, but animation is removed
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()} // Prevent background click when clicking image area
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="block max-w-full max-h-[90vh] object-contain" // Ensure image fits screen
            // Optional: Add loading indicator or error handling here
          />
        </motion.div>

        {/* Optional: Counter */}
        {images.length > 1 && (
           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
             {currentIndex + 1} / {images.length}
           </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox; 