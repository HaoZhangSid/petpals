import React from 'react';
import { User } from '../../types';

interface UserPhotosSectionProps {
  user: User;
  onStartEdit: () => void;
  openLightbox: (images: string[], index: number) => void;
}

// Define API Base URL
const API_BASE_URL = 'http://localhost:8080';

const UserPhotosSection: React.FC<UserPhotosSectionProps> = ({ user, onStartEdit, openLightbox }) => {

  // Helper to construct full photo URL
  const getFullPhotoUrl = (url: string) => {
    return url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700">My Photos</h2>
          <button
            onClick={onStartEdit}
            className="text-skyblue hover:text-blue-600 text-lg"
          >
            ✏️
          </button>
        </div>

        {Array.isArray(user.photos) && user.photos.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {user.photos.slice(0, 7).map((photoUrl: string, index: number) => (
                <div
                  key={index}
                  className={`gallery-item overflow-hidden rounded-xl shadow-sm cursor-pointer ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
                  onClick={() => openLightbox(user.photos || [], index)}
                >
                  <img
                    src={getFullPhotoUrl(photoUrl)}
                    alt={`${user.name} photo ${index + 1}`}
                    className="w-full h-full object-cover hover:opacity-90 transition duration-300 bg-gray-200 aspect-square"
                    // Add onError handler if needed
                    // onError={(e) => { ... }}
                  />
                </div>
              ))}
            </div>

            {user.photos.length > 7 && (
              <button
                className="w-full text-center py-2 mt-3 text-sm text-skyblue hover:text-blue-600 transition"
                onClick={() => openLightbox(user.photos || [], 0)}
              >
                View all {user.photos.length} photos
              </button>
            )}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="text-gray-300 text-5xl mb-4">📷</div>
            <p className="text-gray-500 text-sm text-center mb-4">Share photos of your life with your pets</p>
            <button
              onClick={onStartEdit}
              className="px-4 py-1.5 bg-skyblue text-white rounded-full text-sm hover:bg-blue-500 transition"
            >
              Upload Photos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPhotosSection; 