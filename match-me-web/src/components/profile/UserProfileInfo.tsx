import React from 'react';
import { User, Pet } from '../../types'; // Import Pet maybe needed for user.pets check

interface UserProfileInfoProps {
  user: User;
  pets: Pet[]; // Pass pets array to display count
  onStartEdit: () => void;
}

// API Base URL - Define this constant
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'; // Use VITE env var

// Helper function moved from Profile.tsx
const getInterestTagColor = (index: number): string => {
  const colors = [
    'bg-mintgreen text-green-700',
    'bg-lavender text-purple-700',
    'bg-softpink text-pink-700',
    'bg-skyblue text-blue-700',
    'bg-yellow-100 text-yellow-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700'
  ];
  return colors[index % colors.length];
};

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user, pets, onStartEdit }) => {
  // Construct the full avatar URL using user.avatarUrl
  const displayAvatarUrl = user.avatarUrl // Use the correct field name
    ? user.avatarUrl.startsWith('/uploads/')
      ? `${API_BASE_URL}${user.avatarUrl}`
      : user.avatarUrl // Assume it's already a full URL if it doesn't start with /uploads/
    : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80'; // Default placeholder

  return (
    <>
      {/* Top Section: Banner, Avatar, Basic Info */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-soft mb-8">
        <div className="h-40 bg-gradient-to-r from-lavender to-skyblue relative">
          <button className="absolute right-4 top-4 bg-white p-2 rounded-full shadow-md text-xl hover:bg-gray-100 transition">
            📷 {/* Placeholder - Functionality might need adjustment */}
          </button>
        </div>
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-end sm:items-start">
            <div className="-mt-16 mb-4 sm:mb-0">
              <img
                src={displayAvatarUrl} // Use the constructed URL with the correct field
                alt="User Avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-200 object-cover"
                // Optional: Add onError handler for broken images
                onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80'; // Fallback placeholder
                  target.onerror = null; 
                }}
              />
            </div>
            <div className="sm:ml-6 sm:mt-4 flex-grow">
              <h2 className="text-2xl font-bold text-purple-700">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.location || 'Location not set'}</p>
              <div className="flex flex-wrap mt-2 gap-2">
                <span className={`${getInterestTagColor(0)} px-3 py-1 rounded-full text-sm`}>Pet Parent</span>
                <span className={`${getInterestTagColor(1)} px-3 py-1 rounded-full text-sm`}>Animal Lover</span>
                {Array.isArray(pets) && pets.length > 0 && (
                  <span className={`${getInterestTagColor(2)} px-3 py-1 rounded-full text-sm`}>
                    {pets.length} {pets.length === 1 ? 'Pet' : 'Pets'}
                  </span>
                )}
              </div>
              <button
                onClick={onStartEdit}
                className="mt-4 text-purple-600 hover:text-purple-800 text-sm flex items-center"
              >
                <span className="mr-1">✏️</span>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Personal Info and About Me */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Personal Info Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-700">Personal Info</h2>
            <button
              onClick={onStartEdit}
              className="text-skyblue hover:text-blue-600 text-lg"
            >
              ✏️
            </button>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Full Name</h3>
              <p className="text-gray-700">{user.name}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Email</h3>
              <p className="text-gray-700">{user.email}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Phone</h3>
              <p className="text-gray-700">{user.phone || 'Not Set'}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Location</h3>
              <p className="text-gray-700">{user.location || 'Not Set'}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Member Since</h3>
              <p className="text-gray-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>

        {/* About Me Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-700">About Me</h2>
            <button
              onClick={onStartEdit}
              className="text-skyblue hover:text-blue-600 text-lg"
            >
              ✏️
            </button>
          </div>
          <p className="text-gray-700 text-sm mb-4">
            {user.bio || 'No bio added yet. Click the edit button to add some information about yourself.'}
          </p>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">My Interests</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(user.interests) && user.interests.length > 0 ? (
                user.interests.map((interest, index) => (
                  <span key={index} className={`${getInterestTagColor(index)} px-3 py-1 rounded-full text-sm`}>
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No interests added yet. Click the edit button to add your interests.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfileInfo; 