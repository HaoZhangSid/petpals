// src/mocks/data/index.js
// 统一导出所有模拟数据
export * from './pets';
export * from './stats';
export * from './playdates';
export * from './recommendations';

// src/mocks/data/pets.js
export const mockPets = [
  {
    id: "pet-1",
    name: "奶糖",
    type: "dog",
    breed: "金毛寻回犬",
    age: 3,
    gender: "female",
    avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
    personality: ["友善", "活泼", "喜欢玩水"],
    bio: "非常喜欢和人互动，特别是小孩子。喜欢咬飞盘和球。",
    userId: "user-123"
  },
  // 更多宠物...
];

// 创建其他数据文件: stats.js, playdates.js, recommendations.js 等
