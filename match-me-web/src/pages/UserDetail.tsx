import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Pet, User } from '../types';

const UserDetail = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const petRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 从URL获取要滚动到的宠物ID
  const scrollToPetId = searchParams.get('scrollToPet');

  // 设置ref的回调函数
  const setPetRef = (petId: string) => (el: HTMLDivElement | null) => {
    petRefs.current[petId] = el;
  };

  // 默认头像URL，替代via.placeholder.com
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1566034652452-bf7c8946829c?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // 获取用户信息
        const { data: userData } = await api.get<User>(`/api/users/${userId}`);
        setUser(userData);

        // 获取用户的宠物信息
        const { data: petsData } = await api.get<Pet[]>(`/api/users/${userId}/pets`);
        const petsArray = Array.isArray(petsData) ? petsData : [];
        setPets(petsArray);

        // 如果有scrollToPet参数，设置对应的宠物为active
        if (scrollToPetId) {
          const targetPet = petsArray.find(pet => pet.id === scrollToPetId);
          if (targetPet) {
            setActivePet(targetPet);
            // 等待DOM更新后滚动
            setTimeout(() => {
              const petElement = petRefs.current[scrollToPetId];
              if (petElement) {
                petElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }
        } else if (petsArray.length > 0) {
          setActivePet(petsArray[0]);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, scrollToPetId]);

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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-softpink border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-8 text-center">
        <h1 className="text-xl font-semibold text-gray-700 mb-4">User Not Found</h1>
        <p className="text-gray-500">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-purple-700">{user.name}'s Profile</h1>
      </div>

      {/* User Profile Header */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-soft mb-8">
        <div className="h-40 bg-gradient-to-r from-lavender to-skyblue relative">
          <button className="absolute right-4 top-4 bg-white p-2 rounded-full shadow-md text-xl">
            📷
          </button>
        </div>
        <div className="px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-end sm:items-start">
            <div className="-mt-16 mb-4 sm:mb-0">
              <img 
                src={user.avatar || DEFAULT_AVATAR}
                alt="User Avatar" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-200"
              />
            </div>
            <div className="sm:ml-6 sm:mt-4 flex-grow">
              <h2 className="text-2xl font-bold text-purple-700">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.location || 'Location not set'}</p>
              <div className="flex flex-wrap mt-2 gap-2">
                <span className={getInterestTagColor(0)}>Pet Parent</span>
                <span className={getInterestTagColor(1)}>Animal Lover</span>
                {pets.length > 0 && (
                  <span className={getInterestTagColor(2)}>
                    {pets.length} {pets.length === 1 ? 'Pet' : 'Pets'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info + Photos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-700">Personal Info</h2>
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

        {/* Right Column - About Me */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-700">About Me</h2>
          </div>
          <p className="text-gray-700 text-sm mb-4">
            {user.bio || 'No bio added yet.'}
          </p>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(user.interests) && user.interests.length > 0 ? (
                user.interests.map((interest, index) => (
                  <span key={index} className={getInterestTagColor(index)}>
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No interests added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Photos Gallery - Full Width Section */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-700">Photos</h2>
          </div>
          
          {Array.isArray(user.photos) && user.photos.length > 0 ? (
            <div>
              <div className="grid grid-cols-4 gap-3">
                {user.photos.slice(0, 7).map((photoUrl: string, index: number) => (
                  <div key={index} className={`gallery-item overflow-hidden rounded-xl shadow-sm ${index === 0 ? 'col-span-2 row-span-2' : ''}`}>
                    <img 
                      src={photoUrl} 
                      alt={`${user.name} photo ${index + 1}`} 
                      className="w-full h-full object-cover hover:opacity-90 transition duration-300 bg-gray-200 aspect-square"
                    />
                  </div>
                ))}
              </div>
              
              {user.photos.length > 7 && (
                <button className="w-full text-center py-2 mt-3 text-sm text-skyblue hover:text-blue-600 transition">
                  View all {user.photos.length} photos
                </button>
              )}
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="text-gray-300 text-5xl mb-4">📷</div>
              <p className="text-gray-500 text-sm text-center mb-4">No photos added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Pets Section Title */}
      <h2 className="text-xl font-bold text-purple-700 mb-4">Pets</h2>

      {/* Pet Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        {Array.isArray(pets) && pets.map(pet => (
          <button 
            key={pet.id} 
            onClick={() => setActivePet(pet)} 
            className={`pet-tab rounded-xl bg-white p-3 border-2 shadow-sm flex items-center space-x-3 cursor-pointer flex-shrink-0 transition duration-150 ease-in-out ${activePet?.id === pet.id ? 'border-softpink' : 'border-gray-100 hover:border-gray-300'}`}
          >
            <img 
              src={pet.avatar || DEFAULT_AVATAR}
              alt={pet.name} 
              className={`w-12 h-12 rounded-full border-2 bg-gray-200 ${activePet?.id === pet.id ? 'border-softpink' : 'border-transparent'}`}
            />
            <div>
              <p className={`font-semibold text-sm ${activePet?.id === pet.id ? 'text-purple-700' : 'text-gray-700'}`}>{pet.name}</p>
              <p className="text-xs text-gray-500">{pet.breed || 'Breed not set'}</p>
            </div>
          </button>
        ))}
      </div>

      {activePet ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-700">{activePet.name}'s Profile</h2>
                </div>
                <div className="text-center mb-6">
                  <img 
                    src={activePet.avatar || DEFAULT_AVATAR} 
                    alt={activePet.name} 
                    className="w-32 h-32 rounded-full mx-auto mb-3 border-4 border-softpink bg-gray-200"
                  />
                  <h3 className="font-bold text-lg text-purple-700">{activePet.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {activePet.breed || 'Breed not set'} • {activePet.age || '?'} years old
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender:</span>
                    <span className="font-medium text-gray-800 capitalize">{activePet.gender || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Breed:</span>
                    <span className="font-medium text-gray-800">{activePet.breed || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weight:</span>
                    <span className="font-medium text-gray-800">{activePet.weight ? `${activePet.weight} lbs` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Birthday:</span>
                    <span className="font-medium text-gray-800">{activePet.birthday ? new Date(activePet.birthday).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Microchipped:</span>
                    <span className={`font-medium ${activePet.isMicrochipped ? 'text-green-600' : 'text-gray-500'}`}>{activePet.isMicrochipped ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vaccinated:</span>
                    <span className={`font-medium ${activePet.isVaccinated ? 'text-green-600' : 'text-gray-500'}`}>{activePet.isVaccinated ? 'Up to date' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Neutered/Spayed:</span>
                    <span className={`font-medium ${activePet.isNeutered ? 'text-green-600' : 'text-gray-500'}`}>{activePet.isNeutered ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 px-6 py-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">Personality</h3>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(activePet.personality) && activePet.personality.length > 0 ? (
                    activePet.personality.map((trait, index) => (
                      <span key={index} className="bg-lavender bg-opacity-30 text-purple-700 text-xs px-2 py-1 rounded-full">{trait}</span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No personality traits added.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Activities section */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-700">Favorite Activities</h2>
                </div>
                
                {activePet.favoriteActivities && activePet.favoriteActivities.length > 0 ? (
                  <div className="space-y-3">
                    {activePet.favoriteActivities.slice(0, 3).map((activity, index) => (
                      <div key={index} className="bg-blue-50 rounded-xl p-3 border border-blue-200 flex items-center">
                        <span className="text-2xl mr-3">🎮</span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{activity}</h3>
                        </div>
                      </div>
                    ))}
                    
                    {activePet.favoriteActivities.length > 3 && (
                      <button className="w-full text-center py-2 text-sm text-skyblue hover:text-blue-600 transition">
                        + {activePet.favoriteActivities.length - 3} more activities
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center">
                    <div className="text-gray-300 text-5xl mb-4">🐾</div>
                    <p className="text-gray-500 text-sm text-center mb-4">No activities added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-700">About {activePet.name}</h2>
              </div>
              {activePet.bio ? (
                <p className="text-gray-700 text-sm">
                  {activePet.bio}
                </p>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-sm text-center mb-3">No bio added yet for this pet.</p>
                </div>
              )}
            </div>

            {/* Photo Gallery section */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-700">{activePet.name}'s Photos</h2>
                </div>
                
                {Array.isArray(activePet.photos) && activePet.photos.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-3 gap-3">
                      {activePet.photos.slice(0, 5).map((photoUrl: string, index: number) => (
                        <div key={index} className={`gallery-item overflow-hidden rounded-xl shadow-sm ${index === 0 ? 'col-span-2 row-span-2' : ''}`}>
                          <img 
                            src={photoUrl} 
                            alt={`${activePet.name} photo ${index + 1}`} 
                            className="w-full h-full object-cover hover:opacity-90 transition duration-300 bg-gray-200 aspect-square"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {activePet.photos.length > 5 && (
                      <button className="w-full text-center py-2 mt-3 text-sm text-skyblue hover:text-blue-600 transition">
                        View all {activePet.photos.length} photos
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center">
                    <div className="text-gray-300 text-5xl mb-4">📷</div>
                    <p className="text-gray-500 text-sm text-center mb-4">No photos added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 text-center">
          <p className="text-gray-600 mb-4">No pets added yet.</p>
        </div>
      )}
    </div>
  );
};

export default UserDetail; 