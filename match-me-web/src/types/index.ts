// 用户相关类型
export interface User {
    id: string;
    name: string;
    email: string;
    location?: string | null;
    phone?: string | null;
    bio?: string | null;
    interests?: string[] | null;
    avatarUrl?: string | null;
    photoUrls?: string[] | null;
    photos?: Photo[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  // Added Login Response Type based on API_doc.md
  export interface LoginResponse {
    token: string;
  }
  
  // 宠物相关类型
  export interface Pet {
    id: string;
    userId: string;
    name: string;
    type: string;
    breed?: string | null;
    gender?: string | null;
    weight?: number | null;
    birthday?: string | null;
    bio?: string | null;
    personality?: string[] | null;
    favoriteActivities?: string[] | null;
    playStyle?: string[] | null;
    activityLevel?: string | null;
    isMicrochipped?: boolean | null;
    isVaccinated?: boolean | null;
    isNeutered?: boolean | null;
    avatarUrl?: string | null;
    photoUrls?: string[] | null;
    photos?: Photo[];
    createdAt: string;
    updatedAt: string;
  }
  
  // 消息相关类型
  export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
  }
  
  // 连接请求相关类型
  export interface ConnectionRequest {
    id: string;
    requesterId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Connection {
    id: string;
    requesterId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
    createdAt: string;
    updatedAt: string;
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
  description: string;
  distance: string; // Or calculate based on location data?
  image?: string;
  borderColor?: string; // UI specific, maybe remove later?
  matchScore?: number; // Added match score
  tags?: string[]; // Added tags
}

// --- Photo Type (Added based on API_doc.md) ---
export interface Photo {
  id: string;
  ownerType: "user" | "pet";
  ownerId: string;
  url: string;
  isPrimary: boolean;
  order: number;
  caption?: string | null;
  createdAt: string;
  updatedAt: string;
}