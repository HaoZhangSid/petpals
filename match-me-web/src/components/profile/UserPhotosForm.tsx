import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { motion } from 'framer-motion';

interface UserPhotosFormProps {
  user: User;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const MAX_PHOTOS = 10;

const UserPhotosForm: React.FC<UserPhotosFormProps> = ({ 
  user, 
  onSubmit, 
  onCancel 
}) => {
  // State Management
  const [existingPhotos, setExistingPhotos] = useState<string[]>(user.photos || []);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]); // For Data URLs of new photos
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newPhotoPreviews]); // Rerun if previews change (though cleanup is mainly for unmount)

  // File input trigger
  const handlePhotoClick = () => photoInputRef.current?.click();

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const currentTotalPhotos = existingPhotos.length + newPhotoFiles.length;
      const availableSlots = MAX_PHOTOS - currentTotalPhotos;

      if (files.length > availableSlots) {
        alert(`You can only add ${availableSlots} more photos (Max ${MAX_PHOTOS} total). ${files.length - availableSlots} files were skipped.`);
        files.splice(availableSlots); // Keep only the allowed number
      }

      const validFiles: File[] = [];
      const previewPromises: Promise<string>[] = [];
      const skippedFiles: string[] = [];

      files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          skippedFiles.push(`${file.name} (over 5MB)`);
          return;
        }
        if (!file.type.startsWith('image/')) {
          skippedFiles.push(`${file.name} (not an image)`);
          return;
        }
        validFiles.push(file);
        // Generate object URL for preview
        previewPromises.push(Promise.resolve(URL.createObjectURL(file)));
      });

      setNewPhotoFiles(prev => [...prev, ...validFiles]);
      Promise.all(previewPromises).then(previews => {
        setNewPhotoPreviews(prev => [...prev, ...previews]);
      }).catch(error => {
        console.error("Error generating photo previews:", error);
        alert("Failed to generate some photo previews.");
      });
      
      if (skippedFiles.length > 0) {
        alert(`Skipped files:\n${skippedFiles.join('\n')}`);
      }
      
      // Clear the input value
      if (e.target) e.target.value = ''; 
    }
  };

  // Photo removal handlers
  const handleRemoveExistingPhoto = (indexToRemove: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRemoveNewPhoto = (indexToRemove: number) => {
    // Revoke the object URL before removing the preview
    const previewToRemove = newPhotoPreviews[indexToRemove];
    if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove);
    }
    
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const data = new FormData();

    // Append new photo files
    newPhotoFiles.forEach(file => {
      data.append('userPhotos', file); // Backend expects 'userPhotos' for new user images
    });

    // Append existing photo URLs to keep
    if (existingPhotos.length > 0) {
      existingPhotos.forEach(url => {
        data.append('photos', url); // Backend expects 'photos' for the list of URLs to keep/set
      });
    } else {
      // Signal to clear photos if the existing list is now empty
      data.append('photos', '');
    }

    console.log("Submitting User Photos FormData:");
    for (let [key, value] of data.entries()) { 
      console.log(key, value); 
    }

    try {
      await onSubmit(data); // Call the passed onSubmit function
    } catch (error) {
      console.error("Error submitting user photos:", error);
      alert("Failed to save photos. Please try again."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get display URL for existing photos
  const getExistingPhotoDisplayUrl = (url: string) => {
      return url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
  };
  
  const totalPhotos = existingPhotos.length + newPhotoFiles.length;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onCancel} // Close on overlay click
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */} 
        <div className="p-5 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-purple-700">Edit My Photos ({totalPhotos}/{MAX_PHOTOS})</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Form Content */} 
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow custom-scrollbar space-y-6">
          {/* Existing Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Photos</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {existingPhotos.length > 0 ? (
                existingPhotos.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group aspect-square">
                    <img 
                      src={getExistingPhotoDisplayUrl(url)} 
                      alt={`Existing photo ${index + 1}`} 
                      className="object-cover w-full h-full rounded-lg shadow-sm bg-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove existing photo"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-full">No photos uploaded yet.</p>
              )}
            </div>
          </div>

          {/* New Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Photos</label>
             {/* Hidden file input */}
             <input 
              type="file" 
              ref={photoInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
              multiple
            />
            {/* Add button (conditionally rendered) */}
            {totalPhotos < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition mb-4"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                   </svg>
                  Add Photos ({MAX_PHOTOS - totalPhotos} slots left)
                </button>
            )}

            {/* Display newly selected files previews */}
            {newPhotoPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {newPhotoPreviews.map((previewUrl, index) => (
                  <div key={`new-${index}`} className="relative group aspect-square">
                    <img 
                      src={previewUrl} 
                      alt={`New photo preview ${index + 1}`} 
                      className="object-cover w-full h-full rounded-lg shadow-sm bg-gray-100"
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)} 
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove new photo ${index + 1}`}
                    >
                        ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
             {totalPhotos >= MAX_PHOTOS && (
                <p className="text-sm text-center text-gray-500 mt-2">Maximum number of photos reached.</p>
             )}
          </div>
        </form>

        {/* Footer Actions */} 
        <div className="p-5 border-t border-gray-100 flex justify-end items-center flex-shrink-0 bg-gray-50">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 mr-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button 
            type="button" // Changed to type="button" to prevent implicit form submission
            onClick={handleSubmit} // Call handleSubmit explicitly
            disabled={isSubmitting || (newPhotoFiles.length === 0 && JSON.stringify(existingPhotos) === JSON.stringify(user.photos || []))} // Disable if no changes
            className={`px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white ${
              isSubmitting || (newPhotoFiles.length === 0 && JSON.stringify(existingPhotos) === JSON.stringify(user.photos || []))
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-softpink hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Photos'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserPhotosForm; 