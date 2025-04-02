import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { Pet, Playdate, Recommendation, User, Activity } from '../types';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import UpcomingPlaydates from '../components/dashboard/UpcomingPlaydates';
import { mockActivities } from '../mocks/data/activities';
import { useModal } from '../contexts/ModalContext';
import { mockUserPets } from '../mocks/data/userPets';

const Dashboard = () => {
  const { user } = useUserStore();
  const { openAddPetModal } = useModal();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    newMatches: 12,
    messages: 24,
    profileViews: 89,
    playdates: 5
  });
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch user's pets
        const petsResponse = await api.get<Pet[]>('/users/pets');
        if (Array.isArray(petsResponse?.data) && petsResponse.data.length > 0) {
          setPets(petsResponse.data);
        } else {
          console.error("API response for /users/pets was empty or not an array:", petsResponse?.data);
          console.log("Using mock pet data instead");
          setPets(mockUserPets); // 使用mock数据
        }
        
        // Fetch dashboard stats
        const statsResponse = await api.get<any>('/users/stats'); // Replace 'any' with actual stats type
        setStats(statsResponse.data);
        
        // Fetch PLAYDATES data
        const playdatesResponse = await api.get<Playdate[]>('/api/playdates');

        // Set the raw playdates data first (sorting can happen after filtering if needed)
        if (Array.isArray(playdatesResponse?.data)) {
            setPlaydates(playdatesResponse.data);
        } else {
           console.error("API response for /api/playdates was not an array:", playdatesResponse?.data);
           setPlaydates([]); // Set empty array on error
        }
        
        // Fetch recommendations data
        const recommendationsResponse = await api.get<Recommendation[]>('/api/recommendations');
        if (Array.isArray(recommendationsResponse?.data)) {
            setRecommendations(recommendationsResponse.data);
        } else {
            console.error("API response for /api/recommendations was not an array:", recommendationsResponse?.data);
            setRecommendations([]); // Set empty array on error
        }
        
        // Fetch activities data
        const activitiesResponse = await api.get<Activity[]>('/api/activities');
        if (Array.isArray(activitiesResponse?.data)) {
          setActivities(activitiesResponse.data);
        } else {
          console.error("API response for /api/activities was not an array:", activitiesResponse?.data);
          setActivities(mockActivities); // Use mock data as fallback
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setPets(mockUserPets); // 使用mock数据作为备用
        setPlaydates([]);
        setRecommendations([]);
        setActivities(mockActivities); // Use mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // 获取友好的时间显示
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return diffInDays === 1 ? 'yesterday' : `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };
  
  // 获取活动描述文本
  const getActivityContent = (activity: Activity) => {
    switch (activity.type) {
      case 'like':
        return <>liked your pet <span className="font-medium">{activity.targetPet?.name || ''}</span></>;
      case 'comment':
        return <>commented on your pet's photo</>;
      case 'connection_request':
        return <>sent you a connection request</>;
      case 'connection_accepted':
        return <>accepted your connection request</>;
      case 'photo_added':
        return <>added a new photo of {activity.targetPet?.name || 'their pet'}</>;
      case 'playdate_invitation':
        return <>invited you to a playdate</>;
      case 'profile_view':
        return <>viewed your profile</>;
      default:
        return <>interacted with your profile</>;
    }
  };
  
  // 获取活动按钮
  const getActivityButtons = (activity: Activity) => {
    switch (activity.type) {
      case 'like':
      case 'profile_view':
        return (
          <button className="text-blue-500 hover:text-blue-600 text-sm transition duration-300">
            View
          </button>
        );
      case 'comment':
      case 'photo_added':
        return (
          <button className="text-blue-500 hover:text-blue-600 text-sm transition duration-300">
            Reply
          </button>
        );
      case 'connection_request':
      case 'playdate_invitation':
        return (
          <div className="flex space-x-2">
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-full text-sm transition duration-300">
              Accept
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm transition duration-300">
              Decline
            </button>
          </div>
        );
      case 'connection_accepted':
        return (
          <button className="text-blue-500 hover:text-blue-600 text-sm transition duration-300">
            Message
          </button>
        );
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-softpink border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6 px-4 md:px-8 bg-cream">
      {/* Welcome Message */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 mt-1">Here's the latest with you and your furry friends</p>
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
      
      {/* Stats Cards - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* New Matches Card */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition group">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-softpink to-pink-400"></div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">New Matches</h3>
                  <div className="flex items-end">
                    <p className="text-2xl font-bold text-gray-800">{stats.newMatches}</p>
                    <p className="text-green-500 text-xs ml-2 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      3 from last week
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-softpink to-pink-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link to="/discover" className="text-pink-500 text-sm hover:text-pink-600 transition flex items-center group-hover:underline">
                  Find more matches
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <span className="text-xs text-gray-400">Excellent!</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Messages Card */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition group">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-skyblue to-blue-400"></div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">New Messages</h3>
                  <div className="flex items-end">
                    <p className="text-2xl font-bold text-gray-800">{stats.messages}</p>
                    <p className="text-green-500 text-xs ml-2 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      7 from last week
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-skyblue to-blue-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link to="/messages" className="text-blue-500 text-sm hover:text-blue-600 transition flex items-center group-hover:underline">
                  View conversations
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <span className="text-xs text-gray-400">Active!</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Views Card */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition group">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lavender to-purple-400"></div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Profile Views</h3>
                  <div className="flex items-end">
                    <p className="text-2xl font-bold text-gray-800">{stats.profileViews}</p>
                    <p className="text-green-500 text-xs ml-2 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      12 from last week
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-lavender to-purple-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link to="/profile" className="text-purple-500 text-sm hover:text-purple-600 transition flex items-center group-hover:underline">
                  Update profile
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <span className="text-xs text-gray-400">Popular!</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Playdates Card */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition group">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mintgreen to-green-400"></div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Playdates</h3>
                  <div className="flex items-end">
                    <p className="text-2xl font-bold text-gray-800">{stats.playdates}</p>
                    <p className="text-green-500 text-xs ml-2 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      2 from last week
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-mintgreen to-green-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link to="/playdates" className="text-green-500 text-sm hover:text-green-600 transition flex items-center group-hover:underline">
                  Schedule playdate
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <span className="text-xs text-gray-400">Growing!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Use the new UpcomingPlaydates component */}
      <UpcomingPlaydates playdates={playdates} user={user} />
      
      {/* Pet Info - Enhanced with personality and interactions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Your Furry Friends
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map(pet => (
            <div key={pet.id} className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-md transition duration-300 group">
              <div className="flex items-start">
                <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden mr-4 shadow-sm transform group-hover:scale-105 duration-300">
                  {pet.avatar && <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-pink-600 transition">{pet.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{pet.breed} · {pet.age} yrs</p>
                  
                  {/* Pet Personality Tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pet.personality && pet.personality.slice(0, 3).map((trait, index) => (
                      <span key={index} className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Link to={`/pets/${pet.id}`} className="text-blue-500 text-sm hover:text-blue-700 transition flex items-center">
                  View Profile
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
          
          {/* Add Pet Card - Enhanced */}
          <div 
            onClick={openAddPetModal}
            className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-dashed border-gray-300 hover:border-pink-300 hover:shadow-md transition duration-300 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-20 h-20 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-pink-600 transition">Add a New Pet</h3>
            <p className="text-sm text-gray-600 mt-2">Register your furry, feathery, or scaly friend</p>
            
            <div className="flex-grow"></div>
            
            <div className="mt-4 w-full flex justify-end">
              <span className="text-blue-500 text-sm hover:text-blue-700 transition flex items-center">
                Add Pet
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity - 重新设计 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 hover:shadow-md transition">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          <div className="flex space-x-2">
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition">All</button>
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition">Unread</button>
          </div>
        </div>
        
        <div className="space-y-2">
          {activities.slice(0, 5).map((activity) => (
            <div 
              key={activity.id} 
              className={`flex items-start p-4 rounded-2xl transition duration-300 ${
                activity.read ? 'hover:bg-gray-50' : 'bg-pink-50 hover:bg-pink-100'
              }`}
            >
              <div className="relative">
                <img 
                  src={activity.actor.avatar} 
                  alt={activity.actor.name} 
                  className="w-12 h-12 rounded-xl object-cover shadow-sm"
                />
                {activity.actor.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="text-gray-800">
                    <span className="font-semibold">{activity.actor.name}</span>{' '}
                    {getActivityContent(activity)}
                  </p>
                  <span className="text-xs text-gray-500 mt-1 sm:mt-0">{getTimeAgo(activity.createdAt)}</span>
                </div>
                
                {activity.content && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    "{activity.content}"
                  </div>
                )}
                
                {activity.status === 'pending' && (
                  <div className="mt-2 flex justify-end">
                    {getActivityButtons(activity)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {activities.length > 5 && (
          <div className="mt-4 text-center">
            <button className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium text-sm transition group">
              View All Activities
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {activities.length === 0 && (
          <div className="py-10 text-center">
            <div className="text-5xl mb-4">🐾</div>
            <p className="text-gray-500">No activity yet. Start connecting with other pet owners!</p>
            <button className="mt-4 bg-softpink hover:bg-pink-400 text-white px-4 py-2 rounded-full text-sm transition">
              Explore Nearby Pets
            </button>
          </div>
        )}
      </div>
      
      {/* Recommendations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recommendations</h2>
          <Link to="/discover" className="text-blue-500 hover:underline text-sm">View All</Link>
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
                  <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm transition duration-300 flex-grow mr-2">Connect</button>
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