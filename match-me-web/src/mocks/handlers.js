import { http, delay, HttpResponse } from 'msw';
import { 
  mockPets, 
  mockStats, 
  mockPlaydates, 
  mockRecommendations,
} from './data';

export const handlers = [
  // 获取宠物列表
  http.get('/users/pets', async () => {
    await delay(300); // 添加真实网络延迟感
    return HttpResponse.json(mockPets);
  }),
  
  // 获取统计数据
  http.get('/users/stats', async () => {
    await delay(200);
    return HttpResponse.json(mockStats);
  }),
  
  // 获取约会数据
  http.get('/messages/conversations', async () => {
    await delay(300);
    return HttpResponse.json(mockPlaydates);
  }),
  
  // 获取推荐
  http.get('/discover/recommendations', async () => {
    await delay(400);
    return HttpResponse.json(mockRecommendations);
  }),
  
  // 登录请求
  http.post('/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password') {
      await delay(500);
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          name: '王小明',
          email: 'test@example.com',
          avatar: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
        }
      });
    }
    
    await delay(500);
    return new HttpResponse(null, { status: 401, statusText: '邮箱或密码错误' });
  }),
];
