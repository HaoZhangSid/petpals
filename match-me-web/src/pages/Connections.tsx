import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Connection, ConnectionRequest } from '../types';
import './connections.css';

// Mock data for development
const sampleUsers: User[] = [
  {
    id: 'user1',
    name: 'Mike & Rex',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: true,
    petInfo: 'German Shepherd • 4 yrs',
    pets: []
  },
  {
    id: 'user2',
    name: 'Lisa & Mittens',
    email: 'lisa@example.com',
    avatar: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: false,
    petInfo: 'Persian Cat • 2 yrs',
    pets: []
  },
  {
    id: 'user3',
    name: 'Alex & Coco',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: true,
    petInfo: 'Corgi • 1 yr',
    pets: []
  },
  {
    id: 'user4',
    name: 'Sarah & Whiskers',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: false,
    petInfo: 'Tabby Cat • 3 yrs',
    pets: []
  }
];

const sampleConnections: Connection[] = [
  {
    id: 'conn1',
    users: [sampleUsers[0], { id: 'current-user', name: 'You', email: 'you@example.com', pets: [] }],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks ago
  },
  {
    id: 'conn2',
    users: [sampleUsers[1], { id: 'current-user', name: 'You', email: 'you@example.com', pets: [] }],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month ago
  },
  {
    id: 'conn3',
    users: [sampleUsers[2], { id: 'current-user', name: 'You', email: 'you@example.com', pets: [] }],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'conn4',
    users: [sampleUsers[3], { id: 'current-user', name: 'You', email: 'you@example.com', pets: [] }],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() // 3 weeks ago
  }
];

const sampleRequests: ConnectionRequest[] = [
  {
    id: 'req1',
    sender: {
      id: 'user5',
      name: 'Jake & Buddy',
      email: 'jake@example.com',
      avatar: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      petInfo: 'Labrador • 3 yrs',
      pets: []
    },
    receiver: { id: 'current-user', name: 'You', email: 'you@example.com', pets: [] },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'pending',
    message: 'Hey! Buddy and I would love to connect with you and Max. We go to Central Park often and would love to arrange a playdate!'
  },
  {
    id: 'req2',
    sender: {
      id: 'user6',
      name: 'David & Whiskers',
      email: 'david@example.com',
      avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      petInfo: 'Tabby Cat • 3 yrs',
      pets: []
    },
    receiver: { id: 'current-user', name: 'You', email: 'you@example.com', pets: [] },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'pending',
    message: 'Hi! I noticed Max is good with cats. Whiskers is very social for a cat and would love to make a dog friend. Would you be interested in connecting?'
  },
  {
    id: 'req3',
    sender: {
      id: 'user7',
      name: 'Jessica & Lucy',
      email: 'jessica@example.com',
      avatar: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      petInfo: 'Beagle • 5 yrs',
      pets: []
    },
    receiver: { id: 'current-user', name: 'You', email: 'you@example.com', pets: [] },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'pending',
    message: 'Hello! Lucy and I just moved to the area and are looking to make new friends. She\'s very friendly and loves golden retrievers!'
  }
];

const Connections = () => {
  const [connections, setConnections] = useState(sampleConnections);
  const [requests, setRequests] = useState(sampleRequests);
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'sent'>('connections');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recent');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // Update state, move accepted request from requests to connections
      const acceptedRequest = requests.find(req => req.id === requestId);
      if (acceptedRequest) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        // Simplified: server should return new connection, this is just a simulation
        const newConnection = {
          id: `new-${requestId}`,
          users: [acceptedRequest.sender, acceptedRequest.receiver],
          createdAt: new Date().toISOString()
        };
        setConnections(prev => [...prev, newConnection]);
      }
    } catch (error) {
      console.error('Failed to accept request', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to reject request', error);
    }
  };

  const filteredConnections = searchTerm
    ? connections.filter(connection => 
        connection.users[0].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.users[0].petInfo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : connections;

  // Format date function
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-softpink border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-8 bg-cream min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">My Connections</h1>
        <p className="text-gray-600">Manage your pet friend connections and requests</p>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-4 px-6 border-b-2 ${
                activeTab === 'connections'
                  ? 'border-skyblue text-skyblue font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Connected Friends
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-6 border-b-2 ${
                activeTab === 'requests'
                  ? 'border-softpink text-softpink font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Requests 
              {requests.length > 0 && (
                <span className="ml-2 bg-softpink text-white text-xs rounded-full px-2 py-0.5">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-6 border-b-2 ${
                activeTab === 'sent'
                  ? 'border-mintgreen text-green-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent Requests
            </button>
          </nav>
        </div>
      </div>
      
      {/* Connection Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-skyblue">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Total Connections</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{connections.length}</p>
          <p className="text-green-500 text-xs mt-2">↑ 3 from last month</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-softpink">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Pending Requests</h3>
            <span className="text-2xl">🔔</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{requests.length}</p>
          <p className="text-green-500 text-xs mt-2">↑ 1 from yesterday</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-mintgreen">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Active Chats</h3>
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">5</p>
          <p className="text-green-500 text-xs mt-2">↑ 2 from last week</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-lavender">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Upcoming Playdates</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">2</p>
          <p className="text-gray-500 text-xs mt-2">No change from last week</p>
        </div>
      </div>

      {/* Connected Friends */}
      {activeTab === 'connections' && (
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-bold text-purple-700 mb-4 md:mb-0">Connected Friends</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Search connections..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white rounded-full py-2 pl-10 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-softpink w-full"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <select 
                className="bg-white rounded-full py-2 px-4 shadow-sm border-0 focus:outline-none focus:ring-2 focus:ring-softpink w-full md:w-auto"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recent">Sort by: Recent</option>
                <option value="name">Sort by: Name (A-Z)</option>
                <option value="distance">Sort by: Distance</option>
                <option value="pet-type">Sort by: Pet Type</option>
              </select>
            </div>
          </div>
          
          {filteredConnections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map(connection => {
                // Assume first user is the other user (Not current)
                const otherUser = connection.users[0];
                
                return (
                  <div key={connection.id} className="bg-white rounded-2xl shadow-soft overflow-hidden connection-card border-2 border-skyblue">
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {otherUser.avatar ? (
                            <img 
                              src={otherUser.avatar} 
                              alt={otherUser.name} 
                              className="w-14 h-14 rounded-full border-2 border-skyblue object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full border-2 border-skyblue bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xl font-semibold">
                                {otherUser.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <h3 className="font-bold text-lg text-purple-700">{otherUser.name}</h3>
                            <p className="text-gray-600 text-sm">{otherUser.petInfo || "Pet info unavailable"}</p>
                            <div className="mt-1 flex items-center">
                              <span className={`w-2 h-2 ${otherUser.isOnline ? 'bg-green-400' : 'bg-gray-400'} rounded-full mr-2`}></span>
                              <span className={`${otherUser.isOnline ? 'text-green-600' : 'text-gray-600'} text-xs`}>
                                {otherUser.isOnline ? 'Online now' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="relative group">
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <span className="text-gray-400">•••</span>
                          </button>
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-soft p-2 hidden group-hover:block z-10">
                            <Link to={`/profile/${otherUser.id}`} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                              View Profile
                            </Link>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                              Schedule Playdate
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                              Remove Connection
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <span className="mr-3">📍</span>
                        <span>1.2 miles away</span>
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <span className="mr-3">🤝</span>
                        <span>Connected {formatTimeAgo(connection.createdAt)}</span>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="bg-lavender bg-opacity-30 text-purple-700 text-xs px-3 py-1 rounded-full">Friendly</span>
                        <span className="bg-skyblue bg-opacity-30 text-blue-700 text-xs px-3 py-1 rounded-full">Playful</span>
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">Intelligent</span>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link to={`/messages/${connection.id}`} className="bg-skyblue hover:bg-blue-400 text-white py-2 rounded-full flex items-center justify-center transition duration-300">
                          <span className="mr-1">💬</span> Message
                        </Link>
                        <button className="bg-softpink hover:bg-pink-400 text-white py-2 rounded-full flex items-center justify-center transition duration-300">
                          <span className="mr-1">📅</span> Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No matching connections found' : 'You don\'t have any connections yet'}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-skyblue text-white rounded-xl hover:bg-blue-500 transition"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  to="/discover"
                  className="px-4 py-2 bg-softpink text-white rounded-xl hover:bg-pink-600 transition inline-block"
                >
                  Discover Pet Friends
                </Link>
              )}
            </div>
          )}
          
          {filteredConnections.length > 0 && filteredConnections.length < connections.length && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-white text-purple-700 border border-purple-300 py-2 px-6 rounded-full shadow-sm hover:bg-purple-50 transition duration-300"
              >
                Show All ({connections.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pending Requests */}
      {activeTab === 'requests' && (
        <div>
          <h2 className="text-xl font-bold text-purple-700 mb-6">Pending Requests</h2>
          
          {requests.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {requests.map((request, index) => (
                <div 
                  key={request.id} 
                  className={`p-4 ${index !== requests.length - 1 ? 'border-b border-gray-100' : ''} request-card hover:bg-gray-50`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      {request.sender.avatar ? (
                        <img 
                          src={request.sender.avatar} 
                          alt={request.sender.name} 
                          className="w-12 h-12 rounded-full border border-skyblue object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-skyblue bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-semibold">
                            {request.sender.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="font-semibold text-purple-700">{request.sender.name}</h3>
                        <p className="text-sm text-gray-600">{request.sender.petInfo || "Pet info unavailable"} • 1.5 miles away</p>
                        <p className="text-xs text-gray-500 mt-1">Sent request {formatTimeAgo(request.createdAt)}</p>
                      </div>
                    </div>
                    <div className="md:max-w-md">
                      <p className="text-sm text-gray-600 mb-3">
                        {request.message || "Hey! I would love to connect with you."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-softpink hover:bg-pink-400 text-white px-5 py-2 rounded-full text-sm transition duration-300"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm transition duration-300"
                        >
                          Decline
                        </button>
                        <Link 
                          to={`/profile/${request.sender.id}`}
                          className="bg-white border border-gray-200 text-gray-600 px-5 py-2 rounded-full text-sm hover:bg-gray-50 transition duration-300"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-600">No pending connection requests</p>
            </div>
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <div>
          <h2 className="text-xl font-bold text-purple-700 mb-6">Sent Requests</h2>
          
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">You haven't sent any connection requests yet</p>
            <Link
              to="/discover"
              className="px-4 py-2 bg-softpink text-white rounded-xl hover:bg-pink-600 transition inline-block mt-4"
            >
              Discover Pet Friends
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections; 