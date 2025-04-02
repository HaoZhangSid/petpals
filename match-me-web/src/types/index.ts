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
    phone?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  // 宠物相关类型
  export interface Pet {
    id: string;
    name: string;
    type: string;
    breed: string;
    age: number;
    gender: string;
    avatar?: string;
    personality?: string[];
    bio?: string;
    userId: string;
    weight?: number;
    birthday?: string;
    isMicrochipped?: boolean;
    isVaccinated?: boolean;
    isNeutered?: boolean;
    favoriteActivities?: string[];
    galleryPhotos?: string[];
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

export type PlaydateStatus = 'pending' | 'accepted' | 'declined' | 'requested';
export type PlaydateVisibility = 'public' | 'friends' | 'invited_only' | 'private';
export type PlaydateType = 'my_event' | 'invitation' | 'friends_event' | 'public_nearby';

export interface PlaydatePartner {
  id: string;
  name: string;
  petName: string;
  avatar?: string;
}

export interface PlaydateCreator {
  id: string;
  name: string;
  avatar?: string;
}

export interface Playdate {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  creator: PlaydateCreator;
  partner?: PlaydatePartner;
  participants: PlaydateCreator[];
  icon: string;
  description?: string;
  createdAt: string;
  visibility: PlaydateVisibility;
  statusForCurrentUser?: PlaydateStatus;
  typeForCurrentUser: PlaydateType;
  maxParticipants?: number;
  allowsJoinRequests?: boolean;
}

// Add PlaydateFilter type export
export type PlaydateFilter = 'all' | 'my_event' | 'invitation' | 'public_nearby' | 'friends_event';

// Recommendation Type (used in Dashboard/Discover)
export interface Recommendation {
  id: string;
  ownerName: string;
  petName: string;
  petType: string;
  age: number;
  description: string;
  distance: string; // Or calculate based on location data?
  image?: string;
  borderColor: string; // UI specific, maybe remove?
  matchScore?: number; // Added match score
  tags?: string[]; // Added tags
}