// 用户相关类型
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    location?: string;
    bio?: string;
    interests?: string[];
    createdAt: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  // 宠物相关类型
  export interface Pet {
    id: string;
    name: string;
    type: 'dog' | 'cat' | 'bird' | 'other';
    breed?: string;
    age?: number;
    gender?: 'male' | 'female';
    avatar?: string;
    personality?: string[];
    userId: string;
    bio?: string;
  }
  
  // 消息相关类型
  export interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    read: boolean;
  }
  
  export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    updatedAt: string;
  }
  
  // 连接请求相关类型
  export interface ConnectionRequest {
    id: string;
    senderId: string;
    sender: User;
    receiverId: string;
    receiver: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
  }
  
  export interface Connection {
    id: string;
    users: User[];
    createdAt: string;
  }