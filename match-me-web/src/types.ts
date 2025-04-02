export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
  interests?: string[];
  photos?: string[];
  isOnline?: boolean;
  petInfo?: string;
  pets: Pet[];
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  avatar: string;
  personality: string[];
  bio: string;
  distance: number;
  lastActive: string;
  ownerName: string;
  ownerId: string;
  ownerImage: string;
  activityLevel: 'Very Active' | 'Active' | 'Moderate' | 'Low Energy' | 'Very Calm';
  playStyle: string[];
  location: string;
  gender?: string;
  weight?: number;
  birthday?: string;
  isMicrochipped?: boolean;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  favoriteActivities?: string[];
  photos?: string[];
  description?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

export interface Connection {
  id: string;
  users: User[];
  createdAt: string;
}

export interface ConnectionRequest {
  id: string;
  sender: User;
  receiver: User;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

export interface Activity {
  id: string;
  type: 'match' | 'playdate' | 'message' | 'like' | 'comment' | 'connection_request' | 'connection_accepted' | 'photo_added' | 'profile_view' | 'playdate_invitation';
  actor: User;
  target?: User;
  targetPet?: Pet;
  content?: string;
  createdAt: string;
  status?: 'pending' | 'accepted' | 'declined' | 'completed';
  read: boolean;
}

export interface Playdate {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: User[];
  pets: Pet[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  ownerName: string;
  petName: string;
  petType: string;
  age: number;
  distance: string;
  description: string;
  image?: string;
  borderColor?: string;
}

export interface EnhancedPet extends Pet {
  matchPercentage: number;
  matchReasons: {
    icon: string;
    text: string;
    strength: number;
  }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}