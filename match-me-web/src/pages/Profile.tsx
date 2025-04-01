import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { api } from '../services/api';
import { Pet } from '../types';

const Profile = () => {
  const { user } = useUserStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/users/pets');
        setPets(data);
        if (data.length > 0) {
          setActivePet(data[0]);
        }
      } catch (error) {
        console.error('获取宠物数据失败', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的资料</h1>

      {/* 用户信息 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row items-start">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6">
            {user?.avatar && <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600 mb-4">{user?.location || '未设置地区'}</p>
            <p className="text-gray-700 mb-4">{user?.bio || '还没有添加个人简介'}</p>
            <div>
              <button className="px-4 py-2 bg-pink-500 text-white rounded-xl mr-3 hover:bg-pink-600 transition">
                编辑资料
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                管理宠物
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 宠物信息 */}
      {pets.length > 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">我的宠物</h2>
          
          {/* 宠物选择标签 */}
          <div className="flex overflow-x-auto pb-2 mb-4">
            {pets.map(pet => (
              <button
                key={pet.id}
                onClick={() => setActivePet(pet)}
                className={`px-4 py-2 rounded-xl mr-2 whitespace-nowrap ${
                  activePet?.id === pet.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pet.name}
              </button>
            ))}
          </div>
          
          {activePet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden mb-4">
                  {activePet.avatar && (
                    <img src={activePet.avatar} alt={activePet.name} className="w-full h-full object-cover" />
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="w-full h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {/* 宠物照片 */}
                  </div>
                  <div className="w-full h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {/* 宠物照片 */}
                  </div>
                  <div className="w-full h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {/* 宠物照片 */}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">{activePet.name}</h3>
                <p className="text-gray-600 mb-4">{activePet.breed} · {activePet.age}岁 · {activePet.gender === 'male' ? '男孩' : '女孩'}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">关于</h4>
                  <p className="text-gray-600">{activePet.bio || '还没有添加宠物简介'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">性格特点</h4>
                  <div className="flex flex-wrap">
                    {activePet.personality?.map((trait, index) => (
                      <span key={index} className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm mr-2 mb-2">
                        {trait}
                      </span>
                    )) || '还没有添加性格特点'}
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                  编辑宠物资料
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-600 mb-4">您还没有添加宠物</p>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
            添加宠物
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile; 