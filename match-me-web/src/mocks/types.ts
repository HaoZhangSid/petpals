// Re-export and extend types from the main types.ts
import { User as BaseUser, Pet as BasePet, Message as BaseMessage, Conversation as BaseConversation, Connection, ConnectionRequest, Activity as BaseActivity } from '../types';

// Extend User interface with additional mock-specific properties
export interface User extends BaseUser {
  isOnline?: boolean;
  petInfo?: string;
}

// Re-export Pet interface directly
export type Pet = BasePet;

// Extend Message interface with additional mock-specific properties
export interface Message extends BaseMessage {
  sender: User;
  image?: string;
  createdAt: string;
}

// Extend Conversation interface with additional mock-specific properties
export interface Conversation extends BaseConversation {
  updatedAt: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
    read: boolean;
    sender: User;
  };
}

// Re-export Activity interface with additional mock-specific properties
export interface Activity extends BaseActivity {
  target?: User;
  targetPet?: Pet;
  content?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'completed';
}

// Re-export other types
export type { Connection, ConnectionRequest }; 