import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Pet } from '../types';

const Discover = () => {
  const [recommendedPets, setRecommendedPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/discover/recommendations');
        setRecommendedPets(data);
      } catch (error) {
        console.error('获取推荐失败', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const filteredPets = filterType === 'all' 
    ? recommendedPets 
    : recommendedPets.filter(pet => pet.type === filterType);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">寻找您喜欢的宠物...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">发现宠物</h1>
          <p className="text-gray-600">寻找和您的宠物最合适的玩伴</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex overflow-x-auto pb-2">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl mr-2 whitespace-nowrap ${
              filterType === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            所有宠物
          </button>
          <button 
            onClick={() => setFilterType('dog')}
            className={`px-4 py-2 rounded-xl mr-2 whitespace-nowrap ${
              filterType === 'dog' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            狗狗
          </button>
          <button 
            onClick={() => setFilterType('cat')}
            className={`px-4 py-2 rounded-xl mr-2 whitespace-nowrap ${
              filterType === 'cat' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            猫咪
          </button>
          <button 
            onClick={() => setFilterType('other')}
            className={`px-4 py-2 rounded-xl mr-2 whitespace-nowrap ${
              filterType === 'other' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            其他宠物
          </button>
        </div>
      </div>

      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map(pet => (
            <div key={pet.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-64 bg-gray-200 overflow-hidden">
                {pet.avatar && <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{pet.name}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {pet.type === 'dog' ? '狗狗' : pet.type === 'cat' ? '猫咪' : '其他'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{pet.breed} · {pet.age}岁 · {pet.gender === 'male' ? '男孩' : '女孩'}</p>
                <p className="text-gray-700 mb-4 line-clamp-2">{pet.bio || '这个小家伙还没有介绍自己...'}</p>
                
                {pet.personality && pet.personality.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap">
                      {pet.personality.slice(0, 3).map((trait, index) => (
                        <span key={index} className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm mr-2 mb-2">
                          {trait}
                        </span>
                      ))}
                      {pet.personality.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm mr-2 mb-2">
                          +{pet.personality.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                    联系主人
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-600 mb-4">找不到匹配的宠物</p>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
            重置筛选
          </button>
        </div>
      )}
    </div>
  );
};

export default Discover; 