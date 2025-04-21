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
  pets?: Pet[];
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  birthday?: string | null;
  avatar?: string | null;
  bio?: string | null;
  photos?: string[] | null;
  personality?: string[] | null;
  activityLevel?: string | null;
  favoriteActivities?: string[] | null;
  playStyle?: string[] | null;
  isMicrochipped?: boolean | null;
  isVaccinated?: boolean | null;
  isNeutered?: boolean | null;
  createdAt: string;
  updatedAt: string;
  distance?: number | null;
  lastActive?: string | null;
  ownerName?: string | null;
  ownerImage?: string | null;
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

export type PlaydateType = 'my_event' | 'invitation' | 'friends_event' | 'public_nearby';
export type PlaydateFilter = 'all' | PlaydateType;
export type PlaydateStatus = 'pending' | 'accepted' | 'declined' | 'requested';

export interface Playdate {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  participants?: User[];
  typeForCurrentUser: PlaydateType;
  statusForCurrentUser: PlaydateStatus;
  icon: string;
  creator: User;
  allowsJoinRequests?: boolean;
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