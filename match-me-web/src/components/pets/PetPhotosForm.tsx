import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePetStore } from '../../store/petStore'; // Import Pet store
import { toast } from 'react-hot-toast'; // Import toast for feedback

// Changed Props: removed onSubmit, added petId
interface PetPhotosFormProps {
  petId: string;
  onCancel: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const MAX_PHOTOS = 10;

// Renamed component
const PetPhotosForm: React.FC<PetPhotosFormProps> = ({ 
  petId, // Use petId from props
  onCancel 
}) => {
  // Access store actions
  const uploadPetPhotos = usePetStore(state => state.uploadPetPhotos);
  const storeIsUploading = usePetStore(state => state.isUploadingPhotos);
  const storeError = usePetStore(state => state.error);

  // State Management
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Keep local submitting state for button visual
  
  // Refs
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newPhotoPreviews]);

  // File input trigger
  const handlePhotoClick = () => photoInputRef.current?.click();

  // Photo upload handler (remains largely the same)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const availableSlots = MAX_PHOTOS;

      if (files.length > availableSlots) {
        toast.error(`You can only upload ${availableSlots} photos at a time. ${files.length - availableSlots} files were skipped.`);
        files.splice(availableSlots);
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
        previewPromises.push(Promise.resolve(URL.createObjectURL(file)));
      });

      setNewPhotoFiles(prev => [...prev, ...validFiles]);
      Promise.all(previewPromises).then(previews => {
        setNewPhotoPreviews(prev => [...prev, ...previews]);
      }).catch(error => {
        console.error("Error generating photo previews:", error);
        toast.error("Failed to generate some photo previews.");
      });
      
      if (skippedFiles.length > 0) {
        // Use custom toast for warning-like message
        toast(`Skipped files:\n${skippedFiles.join('\n')}`, {
            icon: '⚠️', // Add warning icon
            duration: 4000 // Show for a bit longer
        });
      }
      
      if (e.target) e.target.value = ''; 
    }
  };

  // Photo removal handlers (remains the same)
  const handleRemoveNewPhoto = (indexToRemove: number) => {
    const previewToRemove = newPhotoPreviews[indexToRemove];
    if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove);
    }
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Form Submission - Modified to use petStore action
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || newPhotoFiles.length === 0) return;
    setIsSubmitting(true);
    
    const data = new FormData();

    newPhotoFiles.forEach((file) => {
      data.append('photos', file); // Backend expects 'photos' key
    });

    console.log(`Submitting New Photos FormData for Pet ID: ${petId}`);
    // Optional: Log FormData entries if needed for debugging
    // for (let [key, value] of data.entries()) { 
    //   console.log(key, value instanceof File ? value.name : value);
    // }

    try {
      // Call the pet store action with petId and formData
      await uploadPetPhotos(petId, data);
      toast.success('Pet photos uploaded successfully!');
      setNewPhotoFiles([]); // Clear local state on success
      setNewPhotoPreviews([]);
      onCancel(); // Close the modal on success
    } catch (error) {
      console.error("Error submitting new pet photos:", error);
      // Use error from store if available, otherwise fallback
      const errorMsg = storeError || (error instanceof Error ? error.message : "Please try again.");
      toast.error(`Upload failed: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalNewPhotos = newPhotoFiles.length;

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
        {/* Header - Changed Title */} 
        <div className="p-5 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-purple-700">Add Pet Photos</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Form Content */} 
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow custom-scrollbar space-y-6">
          {/* New Photo Upload (structure remains the same) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Photos to Upload</label>
             <input 
              type="file" 
              ref={photoInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
              multiple
            />
            <button
              type="button"
              onClick={handlePhotoClick}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
               </svg>
              Add Photos
            </button>

            {/* Display newly selected files previews (remains the same) */}
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
          </div>
        </form>

        {/* Footer Actions */} 
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex justify-end space-x-3 flex-shrink-0">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            // Use store loading state along with local state
            disabled={isSubmitting || storeIsUploading || newPhotoFiles.length === 0}
            className={`px-4 py-2 rounded-full text-sm text-white ${(isSubmitting || storeIsUploading || newPhotoFiles.length === 0) ? 'bg-indigo-300 cursor-not-allowed' : 'bg-softpink hover:bg-pink-500'} transition`}
          >
            {(isSubmitting || storeIsUploading) ? 'Uploading...' : `Upload ${newPhotoFiles.length} Photo(s)`}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PetPhotosForm; 