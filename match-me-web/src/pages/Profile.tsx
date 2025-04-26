import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { usePetStore } from '../store/petStore';
import { User, Pet, Photo } from '../types';
import { useModal } from '../contexts/ModalContext';
import UserProfileForm from '../components/profile/UserProfileForm';
import UserPhotosForm from '../components/profile/UserPhotosForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lightbox from '../components/common/Lightbox';
import MyPetsSection from '../components/profile/MyPetsSection';
import UserProfileInfo from '../components/profile/UserProfileInfo';
import UserPhotosSection from '../components/profile/UserPhotosSection';
import { UserProfileUpdatePayload } from '../components/profile/UserProfileForm';
import { toast } from 'react-hot-toast';

// Define API Base URL (used by helper)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Add the helper function here
const getFullPhotoUrl = (url: string | null | undefined): string => {
  if (!url) return '/placeholder-image.png'; // Handle null/undefined URLs
  return url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
};

const Profile = () => {
  const user = useUserStore(state => state.user);
  const isInitializing = useUserStore(state => state.isInitializing);
  const updateUserProfile = useUserStore(state => state.updateUserProfile);
  const { pets } = usePetStore();
  const uploadUserPhotos = useUserStore(state => state.uploadUserPhotos);
  const isUploading = useUserStore(state => state.isUploading);

  const { openAddPetModal } = useModal();

  const [editingUser, setEditingUser] = useState(false);
  const [isEditingPhotos, setIsEditingPhotos] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);

  const [lightboxPhotos, setLightboxPhotos] = useState<Array<{id: string; url: string; isPrimary?: boolean }>>([]);

  const handleStartEditUser = () => setEditingUser(true);
  const handleStartEditPhotos = () => setIsEditingPhotos(true);
  const handleCancelEdit = () => {
    setEditingUser(false);
    setIsEditingPhotos(false);
  };

  const handleSaveUserProfile = async (userData: UserProfileUpdatePayload) => {
    setIsSaving(true);
    try {
      await updateUserProfile(userData);
      toast.success("Profile updated successfully!");
      setEditingUser(false);
      } catch (error) {
      console.error("Failed to save user profile:", error);
      const errorMsg = error instanceof Error ? error.message : "Please try again.";
      toast.error(`Failed to update profile: ${errorMsg}`);
      } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUserPhotos = async (formData: FormData) => {
    try {
      await uploadUserPhotos(formData);
      toast.success("Photos uploaded successfully!");
      setIsEditingPhotos(false);
    } catch (error) {
      console.error("Failed to upload user photos:", error);
      const storeError = useUserStore.getState().error;
      const errorMsg = storeError || (error instanceof Error ? error.message : "Please try again.");
      toast.error(`Failed to upload photos: ${errorMsg}`);
    }
  };

  const openLightbox = (index: number) => {
    console.log(`[Profile] openLightbox called with index: ${index}`);
    const photosToPass = user?.photos?.map(p => ({ 
        id: p.id, 
        url: getFullPhotoUrl(p.url), 
        isPrimary: p.isPrimary 
    })) || [];
    console.log("[Profile] photosToPass:", photosToPass);

    if (photosToPass.length === 0) {
      console.log("[Profile] No photos to pass, aborting lightbox open.");
      return; 
    }

    console.log(`[Profile] Setting lightbox states: isLightboxOpen=true, currentLightboxIndex=${index}`);
    setLightboxPhotos(photosToPass);
    setCurrentLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-softpink border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
      return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-red-600 mb-3">Access Denied</h2>
                <p className="text-gray-600 mb-4">Could not load user profile. Please log in again.</p>
                 <Link to="/login" className="text-blue-500 hover:underline">Go to Login</Link> 
            </div>
        </div>
      );
  }

  console.log(`[Profile] Rendering, isLightboxOpen: ${isLightboxOpen}`);

  return (
    <div className="container mx-auto p-4 md:p-8 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-700">My Profile</h1>
          <button 
            onClick={handleStartEditUser}
            className="bg-softpink hover:bg-pink-400 text-white px-4 sm:px-6 py-2 rounded-full shadow-md transition duration-300 flex items-center"
          >
            <span className="mr-2">✏️</span>
          Edit Profile
        </button>
      </div>

        <UserProfileInfo user={user} pets={pets} onStartEdit={handleStartEditUser} />

        <UserPhotosSection />

        <MyPetsSection
          openAddPetModal={openAddPetModal}
          openLightbox={openLightbox}
        />
      </div>

      <AnimatePresence>
        {editingUser && ( <UserProfileForm user={user} onSubmit={handleSaveUserProfile} onCancel={handleCancelEdit} /> )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingPhotos && (
          <UserPhotosForm 
            onSubmit={handleSaveUserPhotos} 
            onCancel={() => setIsEditingPhotos(false)}
          />
        )}
      </AnimatePresence>

      {isLightboxOpen && (
        <Lightbox 
          photos={lightboxPhotos}
          startIndex={currentLightboxIndex} 
          onClose={() => setIsLightboxOpen(false)} 
        />
      )}

      <style>
        {`.hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }`}
      </style>
    </div>
  );
};

export default Profile; 