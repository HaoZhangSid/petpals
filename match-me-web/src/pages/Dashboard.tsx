import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { Pet } from '../types';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

// 新增的类型定义
interface Playdate {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  partner: {
    name: string;
    petName: string;
    avatar?: string;
  };
  status: 'tomorrow' | 'next_week' | 'upcoming';
  icon: string;
}

interface Recommendation {
  id: string;
  ownerName: string;
  petName: string;
  petType: string;
  age: number;
  description: string;
  distance: string;
  image?: string;
  borderColor: string;
}

const Dashboard = () => {
  const { user } = useUserStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    newMatches: 0,
    messages: 0,
    profileViews: 0,
    playdates: 0
  });
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // 获取用户的宠物
        const { data: petsData } = await api.get('/users/pets');
        setPets(petsData);
        
        // 获取仪表盘统计数据
        const { data: statsData } = await api.get('/users/stats');
        setStats(statsData);
        
        // 模拟获取约会数据
        // 实际中应该从API获取
        setPlaydates([
          {
            id: '1',
            title: 'Central Park Adventure',
            date: 'Saturday',
            time: '9:00 AM',
            location: 'Central Park Dog Run, NY',
            partner: {
              name: 'Mike',
              petName: 'Rex',
              avatar: 'https://images.unsplash.com/photo-1583511655826-05700442976e'
            },
            status: 'tomorrow',
            icon: '🏞️'
          },
          {
            id: '2',
            title: 'Pet-Friendly Café Visit',
            date: 'Wednesday',
            time: '2:00 PM',
            location: 'Paws & Coffee, 123 Main St',
            partner: {
              name: 'Sarah',
              petName: 'Whiskers',
              avatar: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8'
            },
            status: 'next_week',
            icon: '☕'
          }
        ]);
        
        // 模拟获取推荐数据
        setRecommendations([
          {
            id: '1',
            ownerName: 'Tom',
            petName: 'Bella',
            petType: 'Labrador',
            age: 3,
            description: 'Loves fetch & swimming',
            distance: '1.2 miles',
            image: 'https://images.unsplash.com/photo-1583511655826-05700442976e',
            borderColor: 'border-pink-500'
          },
          {
            id: '2',
            ownerName: 'Lisa',
            petName: 'Mittens',
            petType: 'Persian',
            age: 2,
            description: 'Playful & cuddly',
            distance: '0.8 miles',
            image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6',
            borderColor: 'border-blue-400'
          },
          {
            id: '3',
            ownerName: 'Alex',
            petName: 'Coco',
            petType: 'Corgi',
            age: 1,
            description: 'Energetic & friendly',
            distance: '2.5 miles',
            image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
            borderColor: 'border-purple-400'
          }
        ]);
      } catch (error) {
        console.error('获取仪表盘数据失败', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
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
      {/* 欢迎消息 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来，{user?.name}！</h1>
          <p className="text-gray-600 mt-1">这是您和您的宠物朋友们的最新动态</p>
        </div>
        <div className="flex space-x-3">
          <button className="p-2 bg-pink-100 rounded-full text-pink-500 hover:bg-pink-200 transition relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
          </button>
          <button className="p-2 bg-blue-100 rounded-full text-blue-500 hover:bg-blue-200 transition relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </button>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-200 hover:shadow-md transition">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">新匹配</p>
              <p className="text-xl font-bold">{stats.newMatches}</p>
              <p className="text-green-500 text-xs mt-1">↑ 3 from last week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200 hover:shadow-md transition">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">新消息</p>
              <p className="text-xl font-bold">{stats.messages}</p>
              <p className="text-green-500 text-xs mt-1">↑ 7 from last week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200 hover:shadow-md transition">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">档案浏览</p>
              <p className="text-xl font-bold">{stats.profileViews}</p>
              <p className="text-green-500 text-xs mt-1">↑ 12 from last week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">游玩约会</p>
              <p className="text-xl font-bold">{stats.playdates}</p>
              <p className="text-green-500 text-xs mt-1">↑ 2 from last week</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 即将到来的约会 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">即将到来的约会</h2>
          <Link to="/playdates" className="text-blue-500 hover:underline text-sm">查看全部</Link>
        </div>
        
        <div className="overflow-x-auto flex -mx-2">
          {playdates.map(playdate => (
            <div key={playdate.id} className="w-1/3 px-2 flex-shrink-0">
              <div className={`bg-${playdate.status === 'tomorrow' ? 'green' : 'purple'}-50 rounded-xl p-4 border ${playdate.status === 'tomorrow' ? 'border-green-200' : 'border-purple-200'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`${playdate.status === 'tomorrow' ? 'text-green-600 bg-green-100' : 'text-purple-600 bg-purple-100'} text-xs font-medium rounded-full px-2 py-1`}>
                      {playdate.status === 'tomorrow' ? '明天' : '下周'}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-2">{playdate.title}</h3>
                  </div>
                  <span className="text-2xl">{playdate.icon}</span>
                </div>
                <div className="flex items-center mb-3">
                  <span className="text-gray-600 text-sm mr-2">📅</span>
                  <span className="text-gray-600 text-sm">{playdate.date}, {playdate.time}</span>
                </div>
                <div className="flex items-center mb-3">
                  <span className="text-gray-600 text-sm mr-2">📍</span>
                  <span className="text-gray-600 text-sm">{playdate.location}</span>
                </div>
                <div className="flex items-center">
                  {playdate.partner.avatar && (
                    <img 
                      src={playdate.partner.avatar} 
                      alt={playdate.partner.name} 
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  )}
                  <span className="ml-2 text-gray-600 text-sm">With {playdate.partner.name} & {playdate.partner.petName}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Playdate Card */}
          <div className="w-1/3 px-2 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full flex flex-col items-center justify-center text-center">
              <span className="text-4xl text-gray-300 mb-3">+</span>
              <h3 className="font-medium text-gray-500 mb-2">安排新的约会</h3>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm transition duration-300 mt-2">
                创建约会
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 宠物信息 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">您的宠物</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map(pet => (
            <div key={pet.id} className="bg-gray-50 p-4 rounded-xl flex items-center hover:bg-gray-100 transition">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4">
                {pet.avatar && <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h3 className="font-medium">{pet.name}</h3>
                <p className="text-sm text-gray-500">{pet.breed} · {pet.age}岁</p>
              </div>
            </div>
          ))}
          <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-center hover:bg-gray-100 transition cursor-pointer">
            <button className="flex items-center text-pink-500 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              添加宠物
            </button>
          </div>
        </div>
      </div>
      
      {/* 最近活动 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">最近活动</h2>
        <div className="space-y-4">
          <div className="flex items-start p-3 hover:bg-gray-50 rounded-xl transition duration-300">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
              {/* 用户头像 */}
            </div>
            <div className="flex-1">
              <p>
                <span className="font-medium">李小花</span> 喜欢了你的宠物 
                <span className="font-medium"> 奶糖</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">2小时前</p>
            </div>
            <div className="ml-auto">
              <button className="text-blue-500 hover:text-blue-600 text-sm transition duration-300">查看</button>
            </div>
          </div>
          <div className="flex items-start p-3 hover:bg-gray-50 rounded-xl transition duration-300">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
              {/* 用户头像 */}
            </div>
            <div className="flex-1">
              <p>
                <span className="font-medium">张三</span> 向您发送了好友请求
              </p>
              <p className="text-xs text-gray-500 mt-1">昨天</p>
            </div>
            <div className="ml-auto flex space-x-2">
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-full text-sm transition duration-300">接受</button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm transition duration-300">拒绝</button>
            </div>
          </div>
          <div className="flex items-start p-3 hover:bg-gray-50 rounded-xl transition duration-300">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
              {/* 用户头像 */}
            </div>
            <div className="flex-1">
              <p>
                <span className="font-medium">王五</span> 评论了您的宠物照片
              </p>
              <p className="text-xs text-gray-500 mt-1">3天前</p>
            </div>
            <div className="ml-auto">
              <button className="text-blue-500 hover:text-blue-600 text-sm transition duration-300">回复</button>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button className="text-blue-500 hover:underline text-sm">查看更多活动</button>
        </div>
      </div>
      
      {/* 推荐 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">推荐</h2>
          <Link to="/discover" className="text-blue-500 hover:underline text-sm">查看全部</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${rec.borderColor} hover:shadow-md transition transform hover:-translate-y-1 duration-300`}>
              {rec.image && (
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={rec.image} 
                    alt={`${rec.ownerName} and ${rec.petName}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{rec.ownerName} & {rec.petName}</h3>
                  <span className="text-sm bg-green-100 rounded-full px-2 py-1">{rec.distance}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.petType}, {rec.age} yrs • {rec.description}</p>
                <div className="flex justify-between">
                  <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm transition duration-300 flex-grow mr-2">加为好友</button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition duration-300">💬</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 