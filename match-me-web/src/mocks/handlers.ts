import { http, HttpResponse } from 'msw';
import { 
  mockPets, 
  mockStats, 
  mockPlaydates, 
  mockRecommendations, 
  mockActivities,
  mockMessages,
  mockChatMessages 
} from './data';

// MSW类型定义
type Params = Record<string, string>;
type ConversationKey = keyof typeof mockChatMessages;

export const handlers = [
  // 获取当前用户的宠物数据
  http.get('/users/pets', () => {
    return HttpResponse.json(mockPets);
  }),

  // 获取用户统计数据
  http.get('/users/stats', () => {
    return HttpResponse.json(mockStats);
  }),

  // 获取宠物数据
  http.get('/api/pets', () => {
    return HttpResponse.json(mockPets);
  }),

  // 获取单个宠物数据
  http.get('/api/pets/:petId', ({ params }) => {
    const petId = params.petId as string;
    const pet = mockPets.find(p => p.id === petId);
    
    if (pet) {
      return HttpResponse.json(pet);
    }
    
    return new HttpResponse(
      JSON.stringify({ message: 'Pet not found' }),
      { status: 404 }
    );
  }),

  // 获取统计数据
  http.get('/api/stats', () => {
    return HttpResponse.json(mockStats);
  }),

  // 获取宠物约会数据
  http.get('/api/playdates', () => {
    return HttpResponse.json(mockPlaydates);
  }),

  // 获取推荐数据
  http.get('/api/recommendations', () => {
    return HttpResponse.json(mockRecommendations);
  }),

  // 获取活动数据
  http.get('/api/activities', () => {
    return HttpResponse.json(mockActivities);
  }),

  // 获取消息数据
  http.get('/api/messages', () => {
    return HttpResponse.json(mockMessages);
  }),

  // 获取特定会话的聊天消息
  http.get('/api/messages/:conversationId', ({ params }) => {
    const conversationId = params.conversationId as string;
    
    if (conversationId in mockChatMessages) {
      const messages = mockChatMessages[conversationId as ConversationKey];
      return HttpResponse.json(messages);
    }
    
    return new HttpResponse(
      JSON.stringify({ message: 'Conversation not found' }),
      { status: 404 }
    );
  }),

  // 用户登录
  http.post('/api/auth/login', async () => {
    return HttpResponse.json({
      user: {
        id: 'user-1',
        name: '陈小明',
        email: 'ming@example.com',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36'
      },
      token: 'mock-jwt-token'
    });
  }),

  // 用户注册
  http.post('/api/auth/register', async () => {
    return HttpResponse.json({
      user: {
        id: 'user-new',
        name: '新用户',
        email: 'new@example.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
      },
      token: 'mock-jwt-token'
    }, { status: 201 });
  }),
    // 获取当前用户的宠物数据
    http.get('/users/pets', () => {
        return HttpResponse.json(mockPets);
      }),
    
      // 获取用户统计数据
      http.get('/users/stats', () => {
        return HttpResponse.json(mockStats);
      }),
]; 

