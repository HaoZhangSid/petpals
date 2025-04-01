import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { Pet } from '../types';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

// 定义类型
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
        
        // 获取约会数据
        const { data: playdatesData } = await api.get('/api/playdates');
        setPlaydates(playdatesData || [
          {
            id: '1',
            title: 'Central Park Adventure',
            date: 'Saturday',
            time: '9:00 AM',
            location: 'Central Park Dog Run, NY',
            partner: {
              name: 'Mike',
              petName: 'Rex',
              avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e'
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
        
        // 获取推荐数据
        const { data: recommendationsData } = await api.get('/api/recommendations');
        setRecommendations(recommendationsData || [
          {
            id: '1',
            ownerName: 'Tom',
            petName: 'Bella',
            petType: 'Labrador',
            age: 3,
            description: 'Loves fetch & swimming',
            distance: '1.2 miles',
            image: 'https://images.unsplash.com/photo-1583511655826-05700442976e',
            borderColor: 'border-softpink'
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
            borderColor: 'border-skyblue'
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
            borderColor: 'border-lavender'
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
          <div className="w-16 h-16 border-4 border-softpink border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
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
          <h1 className="text-2xl font-bold text-purple-700">欢迎回来，{user?.name}！👋</h1>
          <p className="text-gray-600 mt-1">这是您和您的宠物朋友们的最新动态</p>
        </div>
        <div className="flex space-x-3">
          <button className="p-2 bg-white rounded-full shadow-md text-pink-500 hover:bg-pink-100 transition relative">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-softpink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
          </button>
          <button className="p-2 bg-white rounded-full shadow-md text-blue-500 hover:bg-blue-100 transition relative">
            <span className="text-xl">✉️</span>
            <span className="absolute -top-1 -right-1 bg-softpink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </button>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-softpink">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">新匹配</h3>
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{stats.newMatches}</p>
          <p className="text-green-500 text-xs mt-2">↑ 3 from last week</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-skyblue">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">新消息</h3>
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{stats.messages}</p>
          <p className="text-green-500 text-xs mt-2">↑ 7 from last week</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-mintgreen">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">档案浏览</h3>
            <span className="text-2xl">👁️</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{stats.profileViews}</p>
          <p className="text-green-500 text-xs mt-2">↑ 12 from last week</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-lavender">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">游玩约会</h3>
            <span className="text-2xl">🎾</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{stats.playdates}</p>
          <p className="text-green-500 text-xs mt-2">↑ 2 from last week</p>
        </div>
      </div>
      
      {/* 即将到来的约会 */}
      <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700">即将到来的约会</h2>
          <Link to="/playdates" className="text-skyblue hover:underline text-sm">查看全部</Link>
        </div>
        
        <div className="overflow-x-auto flex -mx-2">
          {playdates.map(playdate => (
            <div key={playdate.id} className="w-1/3 px-2 flex-shrink-0">
              <div className={`bg-${playdate.status === 'tomorrow' ? 'mintgreen' : 'lavender'} bg-opacity-10 rounded-xl p-4 border ${playdate.status === 'tomorrow' ? 'border-mintgreen' : 'border-lavender'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-${playdate.status === 'tomorrow' ? 'green' : 'purple'}-600 text-xs font-medium bg-${playdate.status === 'tomorrow' ? 'green' : 'purple'}-100 rounded-full px-2 py-1`}>
                      {playdate.status === 'tomorrow' ? 'Tomorrow' : 'Next Week'}
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
                  <img src={playdate.partner.avatar} 
                       alt="User" className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0" />
                  <span className="ml-2 text-gray-600 text-sm">With {playdate.partner.name} & {playdate.partner.petName}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Playdate Card */}
          <div className="w-1/3 px-2 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full flex flex-col items-center justify-center text-center">
              <span className="text-4xl text-gray-300 mb-3">+</span>
              <h3 className="font-medium text-gray-500 mb-2">安排新的宠物约会</h3>
              <button className="bg-softpink hover:bg-pink-400 text-white px-4 py-2 rounded-full text-sm transition duration-300 mt-2">
                创建活动
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 最近活动 */}
      <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
        <h2 className="text-xl font-bold text-purple-700 mb-4">最近活动</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition duration-300">
            <img src="https://images.unsplash.com/photo-1529429617124-95b109e86bb8"
                 alt="User" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <p className="text-gray-800"><span className="font-semibold">Jake & Buddy</span> 向您发送了好友请求</p>
              <p className="text-xs text-gray-400">2小时前</p>
            </div>
            <div className="ml-auto flex space-x-2">
              <button className="bg-softpink hover:bg-pink-400 text-white px-4 py-1 rounded-full text-sm transition duration-300">接受</button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded-full text-sm transition duration-300">拒绝</button>
            </div>
          </div>
          
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition duration-300">
            <img src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8"
                 alt="User" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <p className="text-gray-800"><span className="font-semibold">Sarah & Whiskers</span> 喜欢了您的照片</p>
              <p className="text-xs text-gray-400">5小时前</p>
            </div>
            <div className="ml-auto">
              <button className="text-skyblue hover:text-blue-600 text-sm transition duration-300">查看</button>
            </div>
          </div>
          
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition duration-300">
            <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e"
                 alt="User" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <p className="text-gray-800"><span className="font-semibold">Mike & Rex</span> 给您发送了信息</p>
              <p className="text-xs text-gray-400">昨天</p>
            </div>
            <div className="ml-auto">
              <button className="text-skyblue hover:text-blue-600 text-sm transition duration-300">回复</button>
            </div>
          </div>
          
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition duration-300">
            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b"
                 alt="User" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <p className="text-gray-800"><span className="font-semibold">Alex & Coco</span> 与您安排了一次约会</p>
              <p className="text-xs text-gray-400">2天前</p>
            </div>
            <div className="ml-auto">
              <button className="text-skyblue hover:text-blue-600 text-sm transition duration-300">查看详情</button>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button className="text-skyblue hover:underline text-sm">查看更多活动</button>
        </div>
      </div>
      
      {/* 推荐 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700">推荐</h2>
          <a href="#" className="text-skyblue hover:underline text-sm paw-icon">查看全部 🐾</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map(recommendation => (
            <div key={recommendation.id} className={`bg-white rounded-2xl overflow-hidden shadow-soft ${recommendation.borderColor} recommendation-card`}>
              <img src={recommendation.image}
                   alt="Pet" className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-purple-700">{recommendation.ownerName} & {recommendation.petName}</h3>
                  <span className="text-sm bg-mintgreen rounded-full px-2 py-1">{recommendation.distance}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{recommendation.petType}, {recommendation.age} yrs • {recommendation.description}</p>
                <div className="flex justify-between">
                  <button className="bg-softpink hover:bg-pink-400 text-white px-4 py-2 rounded-full text-sm transition duration-300 flex-grow mr-2">连接</button>
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