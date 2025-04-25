import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { usePetStore } from '../store/petStore';
import { User, Pet } from '../types';
import { useModal } from '../contexts/ModalContext';
import UserProfileForm from '../components/profile/UserProfileForm';
import UserPhotosForm from '../components/profile/UserPhotosForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lightbox from '../components/common/Lightbox';
import MyPetsSection from '../components/profile/MyPetsSection';
import UserProfileInfo from '../components/profile/UserProfileInfo';
import UserPhotosSection from '../components/profile/UserPhotosSection';

const Profile = () => {
  const user = useUserStore(state => state.user);
  const isInitializing = useUserStore(state => state.isInitializing);
  const updateUserProfile = useUserStore(state => state.updateUserProfile);
  const { pets } = usePetStore();

  const { openAddPetModal } = useModal();

  const [editingUser, setEditingUser] = useState(false);
  const [isEditingPhotos, setIsEditingPhotos] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);

  const handleStartEditUser = () => setEditingUser(true);
  const handleStartEditPhotos = () => setIsEditingPhotos(true);
  const handleCancelEdit = () => {
    setEditingUser(false);
    setIsEditingPhotos(false);
  };

  const handleSaveUserProfile = async (formData: FormData) => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      await updateUserProfile(formData);
      setSaveSuccess("Profile updated successfully!");
      setEditingUser(false);
      setTimeout(() => setSaveSuccess(null), 3000);
      } catch (error) {
      console.error("Failed to save user profile:", error);
      setSaveSuccess("Failed to update profile. Please try again.");
      setTimeout(() => setSaveSuccess(null), 4000);
      } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUserPhotos = async (formData: FormData) => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      await updateUserProfile(formData);
      setSaveSuccess("Photos updated successfully!");
      setIsEditingPhotos(false);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error("Failed to save user photos:", error);
      setSaveSuccess("Failed to update photos. Please try again.");
      setTimeout(() => setSaveSuccess(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const openLightbox = (images: string[], index: number) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const fullImageUrls = images.map(img =>
      img.startsWith('/uploads/') ? `${apiBaseUrl}${img}` : img
    );
    setLightboxImages(fullImageUrls);
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

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border ${saveSuccess.includes('Failed') ? 'bg-red-100 border-red-200 text-red-700' : 'bg-green-100 border-green-200 text-green-700'} px-4 py-3 rounded-lg mb-6 flex items-center justify-center`}
            >
              <span className="mr-2">{saveSuccess.includes('Failed') ? '❌' : '✅'}</span>
              {saveSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <UserProfileInfo user={user} pets={pets} onStartEdit={handleStartEditUser} />

        <UserPhotosSection user={user} onStartEdit={handleStartEditPhotos} openLightbox={openLightbox} />

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
            user={user} 
            onSubmit={handleSaveUserPhotos} 
            onCancel={() => setIsEditingPhotos(false)}
          />
        )}
      </AnimatePresence>

      {isLightboxOpen && (
        <Lightbox 
          images={lightboxImages} 
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