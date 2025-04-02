import React, { useState, useEffect } from 'react';
import { Pet } from '../types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface PetProfileModalProps {
  pet: Pet & { 
    matchPercentage?: number;
    matchReasons?: {
      icon: string;
      text: string;
      strength: number;
    }[];
  };
  onClose: () => void;
}

const PetProfileModal: React.FC<PetProfileModalProps> = ({ pet, onClose }) => {
  // 阻止点击内容区域时关闭弹窗
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // 照片轮播功能
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 生成多张照片（实际项目中应该从API获取）
  useEffect(() => {
    const petPhotos = [
      pet.avatar, // 主照片
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97',
      'https://images.unsplash.com/photo-1554456854-55a089fd4cb2'
    ];
    setPhotos(petPhotos);
  }, [pet]);
  
  // 切换到下一张照片
  const nextPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };
  
  // 切换到上一张照片
  const prevPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
      <motion.div 
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={handleContentClick}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* 顶部照片区域 - 轮播图 */}
        <div className="relative h-64 md:h-80 bg-gray-200 overflow-hidden">
          {photos.length > 0 && (
            <motion.img 
              key={currentPhotoIndex}
              src={photos[currentPhotoIndex]} 
              alt={`${pet.name} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* 轮播控制按钮 */}
          {photos.length > 1 && (
            <>
              <button 
                onClick={prevPhoto}
                className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                disabled={isTransitioning}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={nextPhoto}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                disabled={isTransitioning}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* 照片计数指示器 */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {photos.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentPhotoIndex(index)}
                />
              ))}
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {pet.matchPercentage && (
            <div className="absolute bottom-4 left-4 bg-softpink text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
              {pet.matchPercentage}% Match
            </div>
          )}
        </div>
        
        {/* 内容区域 - 可滚动 */}
        <div className="overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            {/* 宠物基础信息 */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-purple-700">{pet.name}</h2>
                  <p className="text-gray-600">{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old</p>
                  <p className="text-gray-500 text-sm mt-1">
                    <span className="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {pet.distance} km away in {pet.location}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">Owner</span>
                  <div className="flex items-center mt-1">
                    <span className="mr-2 text-sm font-medium">{pet.ownerName}</span>
                    <img src={pet.ownerImage} alt={pet.ownerName} className="w-8 h-8 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
              
              {/* 宠物性格特点 */}
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Personality</h3>
                <div className="flex flex-wrap gap-2">
                  {pet.personality.map((trait, index) => (
                    <span key={index} className="bg-lavender bg-opacity-30 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 宠物活动水平和喜欢的活动 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Activity Level</h3>
                  <span className="bg-mintgreen bg-opacity-30 text-green-700 px-3 py-1 rounded-full text-sm">
                    {pet.activityLevel}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Play Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {pet.playStyle.slice(0, 2).map((style, index) => (
                      <span key={index} className="bg-skyblue bg-opacity-30 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {style}
                      </span>
                    ))}
                    {pet.playStyle.length > 2 && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        +{pet.playStyle.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 宠物简介 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">About {pet.name}</h3>
            <p className="text-gray-600">{pet.bio}</p>
          </div>
          
          {/* 匹配理由 */}
          {pet.matchReasons && pet.matchReasons.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Why You Match</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pet.matchReasons.map((reason, index) => (
                  <div key={index} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-start">
                    <span className="text-2xl mr-3 mt-0.5">{reason.icon}</span>
                    <div>
                      <p className="text-gray-800">{reason.text}</p>
                      <div className="mt-1 flex items-center">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-24">
                          <div 
                            className="h-full bg-softpink" 
                            style={{ width: `${Math.min(100, reason.strength * 20)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {["Low", "Fair", "Good", "Strong", "Perfect"][reason.strength - 1]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 其他信息或标签 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {pet.isMicrochipped && (
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-sm font-medium text-gray-700">Microchipped</span>
              </div>
            )}
            {pet.isVaccinated && (
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-sm font-medium text-gray-700">Vaccinated</span>
              </div>
            )}
            {pet.isNeutered && (
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-sm font-medium text-gray-700">Neutered/Spayed</span>
              </div>
            )}
            {pet.gender && (
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-sm font-medium text-gray-700">{pet.gender}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 底部操作按钮 */}
        <div className="border-t border-gray-100 p-4 flex justify-between items-center bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition duration-200"
          >
            Close
          </button>
          <div className="flex gap-3">
            <Link 
              to={`/messages/new?userId=${pet.ownerId || `owner-${pet.ownerName.toLowerCase().replace(/\s+/g, '-')}`}`}
              className="px-5 py-2 bg-softpink hover:bg-pink-500 text-white rounded-full transition duration-200"
            >
              Send Message
            </Link>
            <Link 
              to={`/users/${pet.ownerId || `owner-${pet.ownerName.toLowerCase().replace(/\s+/g, '-')}`}?scrollToPet=${pet.id}`}
              className="px-5 py-2 bg-skyblue hover:bg-blue-500 text-white rounded-full transition duration-200"
            >
              View Full Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PetProfileModal; 