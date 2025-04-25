import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { motion } from 'framer-motion';

interface UserProfileFormProps {
  user: User;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  user, 
  onSubmit, 
  onCancel 
}) => {
  // --- State Management --- 
  // Text fields
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || ''); // Email likely shouldn't be editable
  const [location, setLocation] = useState(user.location || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  const [newInterest, setNewInterest] = useState('');

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  
  // API Base URL for avatar preview construction
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Photo state (keeping for structure, might need merging later if photos are added here)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(user.photos || []);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]); // For new photo previews
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null); // Keep ref if photos are managed here
  
  // Track window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth < 768;
  
  // Updated steps definition to match PetProfileForm structure
  const steps = [
    { title: "Basic Information", fields: ["name", "email", "phone", "location", "avatar"] },
    { title: "About Me", fields: ["bio", "interests"] },
    // Add Photos step if user photos are managed here
    // { title: "Photos", fields: ["photos"] } 
  ];
  
  // --- Event Handlers ---

  // Step navigation
  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1); // Adjusted index for direct step setting
    window.scrollTo(0, 0);
  };
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    } else {
      onCancel();
    }
  };

  // Interest handlers (Updated style)
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests(prev => [...prev, newInterest.trim()]);
      setNewInterest('');
    }
  };
  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(prev => prev.filter(item => item !== interestToRemove));
  };

  // File input triggers
  const handleAvatarClick = () => avatarInputRef.current?.click();
  // const handlePhotoClick = () => photoInputRef.current?.click(); // Uncomment if photos handled here

  // Avatar upload (generates preview)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Avatar image cannot exceed 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file for the avatar');
        return;
      }
      setAvatarFile(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string); // Set preview URL (Data URL)
      reader.readAsDataURL(file);
    }
  };

  // Photo upload (If needed for this form)
  // const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
  // const handleRemoveExistingPhoto = (indexToRemove: number) => { ... };
  // const handleRemoveNewPhoto = (indexToRemove: number) => { ... };

  // --- Form Submission ---
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent double submit
    
    const data = new FormData();

    // Append text fields
    data.append('name', name);
    data.append('location', location);
    data.append('phone', phone);
    data.append('bio', bio);
    data.append('interests', interests.join(',')); 

    // Append new avatar if selected
    if (avatarFile) {
      data.append('avatarImage', avatarFile);
    }

    // Append new photo files if handled here
    // newPhotoFiles.forEach(file => { data.append('userPhotos', file); });

    // Append existing photo URLs to keep if handled here
    // if (existingPhotos.length > 0) { existingPhotos.forEach(url => { data.append('photos', url); }); } 
    // else { data.append('photos', ''); }

    console.log("Submitting User FormData:");
    for (let [key, value] of data.entries()) { console.log(key, value); }

    setIsSubmitting(true);
    try {
      await onSubmit(data); 
    } catch (error) {
      console.error("Error submitting user profile form:", error);
      alert("Failed to save profile. Please try again."); 
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- Rendering Sections (Updated Styles) --- //

  const renderBasicInfoSection = () => {
    // Construct avatar preview URL (Handles Data URLs and relative paths from DB)
    let displayImageUrl = '/placeholder-avatar.png'; // Default placeholder
    if (avatarPreview) {
        if (avatarPreview.startsWith('/uploads/')) {
            displayImageUrl = `${API_BASE_URL}${avatarPreview}`;
        } else {
            displayImageUrl = avatarPreview; // Assume Data URL or full URL
        }
    } else if (user.avatar) { // Use original avatar from user prop if no preview yet
         if (user.avatar.startsWith('/uploads/')) {
            displayImageUrl = `${API_BASE_URL}${user.avatar}`;
        } else {
            displayImageUrl = user.avatar; // Assume full URL
        }
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        {/* Avatar Upload - styled similar to PetProfileForm */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <img 
              src={displayImageUrl}
              alt="Avatar Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto cursor-pointer bg-gray-100"
              onClick={handleAvatarClick}
              onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-avatar.png'; // Fallback placeholder
                  target.onerror = null; 
              }}
            />
            <div 
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              onClick={handleAvatarClick}
            >
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center text-sm font-medium px-2">
                {avatarPreview ? 'Change Photo' : 'Add Photo'}
              </span>
            </div>
          </div>
        </div>
        <input 
          type="file"
          accept="image/*"
          ref={avatarInputRef}
          onChange={handleAvatarUpload}
          className="hidden"
          id="avatar-upload-input"
        />
        
        {/* Text Fields with updated style */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" value={email} disabled 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
          <input type="tel" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
          <input type="text" id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
      </motion.div>
    );
  };
  
  const renderAboutSection = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
       <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">About Me (Optional)</label>
        <textarea id="bio" name="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Share a little about yourself and your connection with pets..."></textarea>
      </div>
      {/* Interests Input - styled similar to PetProfileForm */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Interests (Optional)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {interests.map((interest, index) => (
            <div key={index} className="bg-lavender bg-opacity-30 text-purple-700 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{interest}</span>
              <button 
                type="button"
                onClick={() => handleRemoveInterest(interest)}
                className="ml-2 text-opacity-70 hover:text-opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Add an interest (e.g., Hiking, Dog Parks)"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Press Enter or click Add</p>
      </div>
    </motion.div>
  );

  // Add renderPhotosSection if user photos are managed here
  // const renderPhotosSection = () => ( ... );

   const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderBasicInfoSection();
      case 2: return renderAboutSection();
      // case 3: return renderPhotosSection(); // If photos step added
      default: return renderBasicInfoSection();
    }
  };

  return (
     <motion.div 
      initial={{ opacity: 0, y: 20 }} // Match PetProfileForm animation
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto" // Match PetProfileForm overlay
    >
      {/* Changed bg-cream to bg-white, updated max-h/max-w, padding, borders */}
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header - updated padding, border */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-purple-700">Edit Your Profile</h2> {/* Updated size/weight */}
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Stepper - Replaced with PetProfileForm style */}
        {!isMobile && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div 
                    className="flex items-center cursor-pointer group" 
                    onClick={() => handleStepClick(index)}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        currentStep > index + 1 
                          ? 'bg-green-500 text-white' 
                          : currentStep === index + 1 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                      }`}
                    >
                      {currentStep > index + 1 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`ml-2 text-sm transition-colors duration-200 ${
                      currentStep === index + 1 
                        ? 'font-medium text-gray-700' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Stepper (If needed, copy from PetProfileForm) */}
        {isMobile && (
             <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                    Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
             </div>
        )}
        
        {/* Form Content - updated padding */} 
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="p-4 sm:p-6">
                {renderCurrentStep()}
             </div>
        </form>

        {/* Footer Actions - updated padding, border, button styles */} 
        <div className="border-t border-gray-100 p-4 sm:p-6 bg-white flex justify-between items-center">
          <button 
            type="button" 
            onClick={handlePrevStep}
            className="px-5 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition" // Updated style
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button 
            type="button" 
            onClick={handleNextStep} 
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-full transition text-white ${isSubmitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-softpink hover:bg-pink-500'}`} // Updated style
          >
            {isSubmitting ? 'Saving...' : (currentStep === steps.length ? 'Save Profile' : 'Next')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileForm; 