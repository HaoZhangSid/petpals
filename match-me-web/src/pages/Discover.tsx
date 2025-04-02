import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Pet } from '../types';
import MatchCard from '../components/MatchCard';
import UserPreferences, { UserPreferenceSettings } from '../components/UserPreferences';
import UserOnboarding from '../components/UserOnboarding';
import { motion } from 'framer-motion';
import './discover.css'; // 引入CSS模块
import PetProfileModal from '../components/PetProfileModal';

// 扩展Pet类型，包含匹配相关属性
interface EnhancedPet extends Pet {
  matchPercentage: number;
  matchReasons: {
    icon: string;
    text: string;
    strength: number;
  }[];
}

// Helper function to format last active time
const formatLastActive = (timestamp: string) => {
  const now = new Date();
  const lastActive = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return lastActive.toLocaleDateString();
};

const Discover = () => {
  const [recommendedPets, setRecommendedPets] = useState<EnhancedPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedPet, setSelectedPet] = useState<EnhancedPet | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferenceSettings>({
    petTypes: ['Dog', 'Cat'],
    maxDistance: 25,
    ageRanges: { min: 0, max: 15 },
    activityLevel: ['Active', 'Moderate'],
    personality: ['Friendly', 'Playful'],
    playStyles: ['Gentle', 'Fetch']
  });
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 6;

  // 检查用户是否是首次访问
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedDiscover');
    if (!hasVisitedBefore) {
      setShowOnboarding(true);
      localStorage.setItem('hasVisitedDiscover', 'true');
    }
  }, []);

  // 刷新数据
  const refreshData = async () => {
    try {
      setIsLoading(true);
      // 尝试从API获取数据
      const { data } = await api.get<EnhancedPet[]>('/api/discover/recommendations');
      
      // 检查API返回数据是否有效
      if (!Array.isArray(data) || data.length === 0) {
        console.log("API returned empty or invalid data, using mock data instead");
        // 由于我们已经更新了handler，它会直接返回完整的mock数据，不需要额外处理
        const { data: mockData } = await api.get<EnhancedPet[]>('/api/discover/recommendations');
        if (Array.isArray(mockData) && mockData.length > 0) {
          setRecommendedPets(mockData);
        } else {
          // 如果mock数据也无法获取，设置空数组
          setRecommendedPets([]);
        }
      } else {
        // 直接使用API返回的数据，不需要额外处理
        setRecommendedPets(data);
      }
      setCurrentPage(1); // 重置为第一页
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
      console.log("API error, using mock data as fallback");
      
      // 尝试直接从handler获取mock数据
      try {
        const { data: mockData } = await api.get<EnhancedPet[]>('/api/discover/recommendations');
        if (Array.isArray(mockData) && mockData.length > 0) {
          setRecommendedPets(mockData);
        } else {
          // 如果mock数据也无法获取，设置空数组
          setRecommendedPets([]);
        }
      } catch (fallbackError) {
        console.error('Failed to fetch mock data as fallback', fallbackError);
        setRecommendedPets([]);
      }
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 应用用户偏好设置
  const applyPreferences = (preferences: UserPreferenceSettings) => {
    setUserPreferences(preferences);
    setShowFilters(false);
    
    // 这里可以根据新的偏好重新请求匹配的宠物，但在本示例中我们只是过滤现有的
    // 实际实现中可能需要调用API并传入偏好参数
  };

  // 根据用户偏好过滤宠物
  const filteredPets = recommendedPets.filter(pet => {
    // 按宠物类型筛选
    if (userPreferences.petTypes.length > 0 && 
        !userPreferences.petTypes.some(type => pet.type.toLowerCase() === type.toLowerCase())) {
      return false;
    }
    
    // 按距离筛选
    if (pet.distance > userPreferences.maxDistance) {
      return false;
    }
    
    // 按年龄筛选
    if (pet.age < userPreferences.ageRanges.min || pet.age > userPreferences.ageRanges.max) {
      return false;
    }
    
    // 按性格筛选 (如果有选择性格特征)
    if (userPreferences.personality.length > 0 && pet.personality && 
        !userPreferences.personality.some(trait => 
          pet.personality?.some(petTrait => 
            petTrait.toLowerCase().includes(trait.toLowerCase())
          )
        )) {
      return false;
    }
    
    return true;
  });
  
  // 排序 - 默认按匹配度排序
  const sortedPets = [...filteredPets].sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  // 页码计算
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = sortedPets.slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil(sortedPets.length / petsPerPage);
  
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const onboardingSteps = [
    {
      title: "Find Your Pet's Perfect Match",
      description: "Discover compatible pets in your area based on personality, play style, and more.",
      image: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      action: {
        text: "Let's Get Started",
      }
    },
    {
      title: "Personalize Your Experience",
      description: "Set your preferences to find the most compatible matches for your pet.",
      image: "https://images.unsplash.com/photo-1583511655826-05700442b31b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      action: {
        text: "Set Preferences",
      }
    },
    {
      title: "Connect and Communicate",
      description: "When you find a match, you can connect with the owner and arrange playdates.",
      image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
    }
  ];

  // 打开宠物详情弹窗
  const handleViewProfile = (petId: string) => {
    const pet = recommendedPets.find(p => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
      setShowPetModal(true);
    }
  };

  // 关闭宠物详情弹窗
  const handleCloseModal = () => {
    setShowPetModal(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-softpink border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding pets you'll love...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-cream">
      {showOnboarding && (
        <UserOnboarding 
          steps={onboardingSteps} 
          onComplete={() => {
            setShowOnboarding(false);
            setShowFilters(true);
          }}
        />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-700 mb-2">Discover Pet Friends</h1>
          <p className="text-gray-600">Find the perfect playmates for your furry companion</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button 
            onClick={refreshData}
            className="bg-white hover:bg-gray-50 px-4 py-2 rounded-full shadow-md text-gray-700 text-sm flex items-center"
          >
            <span className="mr-2">🔄</span> Refresh
          </button>
          <button 
            className="bg-softpink hover:bg-pink-400 text-white px-4 py-2 rounded-full shadow-md text-sm transition duration-300 flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="mr-2">🔍</span> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <UserPreferences 
            initialPreferences={userPreferences}
            onSave={applyPreferences}
          />
        </motion.div>
      )}
      
      {/* Pet Profile Modal */}
      {showPetModal && selectedPet && (
        <PetProfileModal 
          pet={selectedPet}
          onClose={handleCloseModal}
        />
      )}
      
      {currentPets.length > 0 ? (
        <>
          {/* Match Stats */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <p className="text-gray-700">
              <span className="font-semibold">{filteredPets.length}</span> matches found based on your preferences
            </p>
          </div>
          
          {/* Discover Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {currentPets.map((pet) => (
              <MatchCard
                key={pet.id}
                id={pet.id}
                name={pet.name}
                image={pet.avatar || 'https://via.placeholder.com/500x300'}
                petType={pet.type}
                breed={pet.breed}
                age={pet.age}
                distance={pet.distance}
                lastActive={pet.lastActive ? formatLastActive(pet.lastActive) : 'Never'}
                matchPercentage={pet.matchPercentage}
                matchReasons={pet.matchReasons}
                ownerId={pet.ownerId}
                ownerName={pet.ownerName}
                ownerImage={pet.ownerImage}
                onViewProfile={() => handleViewProfile(pet.id)}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                  className={`w-10 h-10 rounded-full ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-100'} shadow-sm flex items-center justify-center`}
                  disabled={currentPage === 1}
                >
                  <span className="text-gray-500">←</span>
                </button>
                
                {(() => {
                  const pages = [];
                  const maxButtons = 5; // 最多显示5个按钮
                  
                  if (totalPages <= maxButtons) {
                    // 如果总页数少于等于5，全部显示
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // 如果总页数大于5，显示部分页码
                    if (currentPage <= 3) {
                      // 当前页靠近开始
                      pages.push(1, 2, 3, 4, '...', totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      // 当前页靠近结束
                      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      // 当前页在中间
                      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                    }
                  }
                  
                  return pages.map((page, index) => {
                    if (page === '...') {
                      return <span key={`ellipsis-${index}`} className="text-gray-500">...</span>;
                    }
                    
                    return (
                      <button 
                        key={index}
                        onClick={() => paginate(page as number)}
                        className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center ${
                          currentPage === page ? 'bg-softpink text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
                
                <button 
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                  className={`w-10 h-10 rounded-full ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-100'} shadow-sm flex items-center justify-center`}
                  disabled={currentPage === totalPages}
                >
                  <span className="text-gray-500">→</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 text-center">
          <div className="mb-4 text-5xl">🔍</div>
          <h3 className="text-xl font-bold text-purple-700 mb-2">No matching pets found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your preferences to find more matches</p>
          <button 
            onClick={() => {
              setUserPreferences({
                petTypes: ['Dog', 'Cat'],
                maxDistance: 50,
                ageRanges: { min: 0, max: 15 },
                activityLevel: ['Very Active', 'Active', 'Moderate', 'Low Energy', 'Very Calm'],
                personality: [],
                playStyles: []
              });
              refreshData();
            }} 
            className="px-6 py-3 bg-softpink text-white rounded-full hover:bg-pink-400 transition shadow-md"
          >
            Reset Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default Discover; 