import { http, HttpResponse, delay } from 'msw';
import { User, Message, Conversation, Pet, Connection, ConnectionRequest } from './types';
import { 
  mockChatMessages,
  mockConversations,
  mockPets, 
  mockStats, 
  mockPlaydates, 
  mockRecommendations, 
  mockActivities,
  mockMessages,
  connections as mockConnections,
  connectionRequests as mockConnectionRequests,
  mockDiscoverPets
} from './data';
import { mockUser } from './data/user';
import { mockUserPets } from './data/userPets';
import { mockUserStats } from './data/userStats';

// 添加更多的模拟用户数据，包括宠物信息
const mockUsers = [
  {
    ...mockUser,
    bio: "Pet lover from San Francisco. I enjoy taking my pets on adventures and meeting other pet parents.",
    location: "San Francisco, CA",
    phone: "+1 (415) 555-1234",
    interests: ["Hiking", "Photography", "Beach Trips", "Dog Training"],
    createdAt: "2023-01-15T08:00:00Z",
    photos: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    ],
    pets: mockUserPets
  },
  {
    id: 'user-2',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    bio: "Dog enthusiast and trainer. My German Shepherd Rex is my best friend and adventure buddy.",
    location: "Oakland, CA",
    phone: "+1 (510) 555-2345",
    interests: ["Dog Training", "Hiking", "Camping", "Photography"],
    createdAt: "2022-11-20T10:30:00Z",
    photos: [
      "https://images.unsplash.com/photo-1583511655826-05700442b31b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1568572933382-74d440642117?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    ],
    pets: [
      {
        id: 'pet-3',
        name: 'Rex',
  type: 'Dog',
        breed: 'German Shepherd',
        age: 4,
        avatar: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80',
        personality: ['Loyal', 'Protective', 'Smart', 'Energetic'],
        bio: "Rex is a loyal and protective German Shepherd who excels at training and loves adventures.",
        distance: 5.2,
        lastActive: new Date().toISOString(),
        ownerName: 'Mike Wilson',
        ownerId: 'user-2',
        ownerImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
        activityLevel: 'Very Active',
        playStyle: ['Fetch', 'Training', 'Running'],
        location: 'Oakland, CA',
        weight: 85,
        birthday: '2020-03-10',
  isMicrochipped: true,
        isVaccinated: true,
  isNeutered: true,
        favoriteActivities: ['Training', 'Hiking'],
        photos: [
          'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
        ],
        gender: 'Male'
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Lisa Chen',
    email: 'lisa@example.com',
    avatar: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    bio: "Cat lover and artist. Mittens is my fluffy feline companion who loves relaxed playdates.",
    location: "Berkeley, CA",
    phone: "+1 (510) 555-3456",
    interests: ["Art", "Reading", "Cat Cafes", "Yoga"],
    createdAt: "2023-02-05T14:20:00Z",
    photos: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    ],
    pets: [
      {
        id: 'pet-4',
        name: 'Mittens',
  type: 'Cat',
        breed: 'Persian',
  age: 2,
        avatar: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80',
        personality: ['Calm', 'Affectionate', 'Fluffy', 'Lazy'],
        bio: "Mittens is a gentle Persian cat who loves gentle play and lots of naps.",
        distance: 7.8,
        lastActive: new Date().toISOString(),
        ownerName: 'Lisa Chen',
        ownerId: 'user-3',
        ownerImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
        activityLevel: 'Low Energy',
        playStyle: ['String Play', 'Laser Pointer'],
        location: 'Berkeley, CA',
  weight: 10, 
        birthday: '2022-05-15',
        isMicrochipped: true,
  isVaccinated: true,
  isNeutered: true,
        favoriteActivities: ['Window Watching', 'Napping'],
        photos: [
          'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1511044568932-338cba0ad803?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
        ],
        gender: 'Female'
      }
    ]
  }
];

// Helper function to format last active time
const formatLastActive = (timestamp: string): string => {
  const now = new Date();
  const lastActive = new Date(timestamp);
  const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d ago`;
  return lastActive.toLocaleDateString();
};

// Define handlers
export const getUserHandler = http.get('/api/user', async () => {
  await delay(500);
  return HttpResponse.json(mockUser);
});

// 获取指定用户详细信息的处理程序
export const getUserByIdHandler = http.get('/api/users/:userId', async ({ params }) => {
  const { userId } = params;
  await delay(500);
  
  const user = mockUsers.find(user => user.id === userId);
  
  if (user) {
    return HttpResponse.json(user);
  } else {
    return new HttpResponse(JSON.stringify({ error: 'User not found' }), { 
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});

// 获取指定用户的宠物列表
export const getUserPetsByIdHandler = http.get('/api/users/:userId/pets', async ({ params }) => {
  const { userId } = params;
  await delay(500);
  
  const user = mockUsers.find(user => user.id === userId);
  
  if (user && user.pets) {
    return HttpResponse.json(user.pets);
  } else {
    return HttpResponse.json([]);
  }
});

export const getUserMeHandler = http.get('/api/users/me', async () => {
  await delay(500);
  // 返回增强版的用户数据，包含更多个人资料信息
  const enhancedUser = {
    ...mockUser,
    location: 'San Francisco, CA',
    phone: '123-456-7890',
    bio: 'Passionate pet lover living in SF. Working as a graphic designer. Enjoy hiking, photography, and spending quality time with my furry companions.',
    interests: ['Hiking', 'Photography', 'Art & Design', 'Crafting', 'Dog Training', 'Local Meetups'],
    createdAt: '2021-06-15T10:00:00Z',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    pets: mockUserPets
  };
  return HttpResponse.json(enhancedUser);
});

export const getUserPetsHandler = http.get('/users/pets', async () => {
  await delay(500);
  return HttpResponse.json(mockUserPets);
});

export const getUserStatsHandler = http.get('/users/stats', async () => {
  await delay(500);
  return HttpResponse.json(mockUserStats);
});

export const getDiscoverRecommendationsHandler = http.get('/api/discover/recommendations', async () => {
  await delay(500);
  const enhancedPets = mockDiscoverPets.map(pet => {
    // 生成70-98%之间的随机匹配度，但固定随机种子以保持一致性
    const matchPercent = 70 + (parseInt(pet.id.replace(/[^\d]/g, '')) % 29);
    
    // 固定的匹配原因数据，而不是每次随机生成
    const possibleReasons = [
      { icon: '🐾', text: 'Your pets are similar breeds', strength: 4 },
      { icon: '📍', text: `Lives ${pet.distance} km away from you`, strength: 3 },
      { icon: '🏃', text: 'Similar activity levels', strength: 5 },
      { icon: '🎮', text: 'Compatible play styles', strength: 4 },
      { icon: '🧠', text: 'Matching pet personalities', strength: 3 },
      { icon: '⏰', text: 'Active around the same times', strength: 2 },
      { icon: '🎂', text: 'Similar age group', strength: 4 },
      { icon: '💼', text: 'Owner has similar interests', strength: 3 }
    ];
    
    // 根据宠物ID确定固定数量的原因，而不是随机选择
    const reasonCount = 2 + (parseInt(pet.id.replace(/[^\d]/g, '')) % 3);
    // 可以根据宠物ID选择固定的原因，而不是随机排序
    const selectedReasons = possibleReasons.slice(parseInt(pet.id.replace(/[^\d]/g, '')) % 3, parseInt(pet.id.replace(/[^\d]/g, '')) % 3 + reasonCount);
    
    return {
      ...pet,
      lastActive: formatLastActive(pet.lastActive),
      matchPercentage: matchPercent,
      matchReasons: selectedReasons,
      // 确保始终有ownerId，如果没有则从ownerName生成
      ownerId: pet.ownerId || `owner-${pet.ownerName.toLowerCase().replace(/\s+/g, '-')}`
    };
  });
  
  return HttpResponse.json(enhancedPets);
});

export const getActivitiesHandler = http.get('/api/activities', async () => {
  await delay(500);
  return HttpResponse.json(mockActivities);
});

// 添加登录处理程序
export const loginHandler = http.post('/api/auth/login', async ({ request }) => {
  await delay(500);
  const body = await request.json() as { email?: string; password?: string };
  
  // 验证凭据 - 简单版本，任何 email/password 组合都成功
  // 实际应用中可以根据 email 检查特定用户
  if (body && body.email && body.password) {
    return HttpResponse.json({ 
      user: mockUser, 
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15) 
    });
  }
  
  // 如果缺少凭据，返回 401 错误
  return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json'
    }
  });
});

export const updateUserProfileHandler = http.patch('/api/users/me', async ({ request }) => {
  await delay(500);
  const updateData = await request.json() as Partial<typeof mockUser>;
  
  // 合并更新数据与现有用户数据
  const updatedUser = {
    ...mockUser,
    ...updateData,
    // 确保 id 和 email 不被覆盖，保持一致性
    id: mockUser.id,
    email: mockUser.email
  };
  
  return HttpResponse.json(updatedUser);
});

// 获取单个宠物详情
export const getPetDetailHandler = http.get('/api/pets/:id', async ({ params }) => {
  const { id } = params;
  
  // 从所有数据源中查找匹配的宠物
  const allPets = [...mockDiscoverPets, ...mockUserPets];
  const pet = allPets.find(pet => pet.id === id);
  
  await delay(500);
    
    if (pet) {
      return HttpResponse.json(pet);
  } else {
    return new HttpResponse(JSON.stringify({ error: 'Pet not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});

// Export all handlers
export const handlers = [
  // Auth API
  loginHandler,
  
  // User API
  getUserHandler,
  getUserMeHandler,
  updateUserProfileHandler,
  getUserPetsHandler,
  getUserStatsHandler,
  getUserByIdHandler,
  getUserPetsByIdHandler,

  // Playdates API
  http.get('/api/playdates', async () => {
    await delay(500);
    return HttpResponse.json(mockPlaydates);
  }),

  // Recommendations API
  http.get('/api/recommendations', async () => {
    await delay(500);
    return HttpResponse.json(mockRecommendations);
  }),

  // Activities API
  getActivitiesHandler,

  // Discover recommendations handler
  getDiscoverRecommendationsHandler,

  // Messages API
  http.get('/api/messages', async () => {
    await delay(500);
    return HttpResponse.json(mockMessages);
  }),

  // Connections API
  http.get('/api/connections', async () => {
    await delay(500);
    return HttpResponse.json(mockConnections);
  }),

  // Connection Requests API
  http.get('/api/connection-requests', async () => {
    await delay(500);
    return HttpResponse.json(mockConnectionRequests);
  }),

  getPetDetailHandler
]; 


