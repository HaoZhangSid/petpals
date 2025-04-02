import { User } from '../types';
import { Connection, ConnectionRequest } from '../../types';

// Sample user data
const users: User[] = [
  {
    id: 'user1',
    name: 'Mike & Rex',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: true,
    petInfo: 'German Shepherd • 4 yrs',
    pets: []
  },
  {
    id: 'user2',
    name: 'Lisa & Mittens',
    email: 'lisa@example.com',
    avatar: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: false,
    petInfo: 'Persian Cat • 2 yrs',
    pets: []
  },
  {
    id: 'user3',
    name: 'Alex & Coco',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: true,
    petInfo: 'Corgi • 1 yr',
    pets: []
  },
  {
    id: 'user4',
    name: 'Sarah & Whiskers',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: false,
    petInfo: 'Tabby Cat • 3 yrs',
    pets: []
  },
  {
    id: 'user5',
    name: 'Jake & Buddy',
    email: 'jake@example.com',
    avatar: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: false,
    petInfo: 'Labrador • 3 yrs',
    pets: []
  },
  {
    id: 'user6',
    name: 'David & Whiskers',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: true,
    petInfo: 'Tabby Cat • 3 yrs',
    pets: []
  },
  {
    id: 'user7',
    name: 'Jessica & Lucy',
    email: 'jessica@example.com',
    avatar: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: false,
    petInfo: 'Beagle • 5 yrs',
    pets: []
  },
  {
    id: 'current-user',
    name: 'You',
    email: 'you@example.com',
    avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    isOnline: true,
    petInfo: 'Golden Retriever • 3 yrs',
    pets: []
  }
];

// Sample connections
export const connections: Connection[] = [
  {
    id: 'conn1',
    users: [users[0], users[7]],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks ago
  },
  {
    id: 'conn2',
    users: [users[1], users[7]],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month ago
  },
  {
    id: 'conn3',
    users: [users[2], users[7]],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'conn4',
    users: [users[3], users[7]],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() // 3 weeks ago
  }
];

// Sample connection requests
export const connectionRequests: ConnectionRequest[] = [
  {
    id: 'req1',
    sender: users[4],
    receiver: users[7],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'pending',
    message: 'Hey! Buddy and I would love to connect with you and Max. We go to Central Park often and would love to arrange a playdate!'
  },
  {
    id: 'req2',
    sender: users[5],
    receiver: users[7],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'pending',
    message: 'Hi! I noticed Max is good with cats. Whiskers is very social for a cat and would love to make a dog friend. Would you be interested in connecting?'
  },
  {
    id: 'req3',
    sender: users[6],
    receiver: users[7],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'pending',
    message: 'Hello! Lucy and I just moved to the area and are looking to make new friends. She\'s very friendly and loves golden retrievers!'
  }
]; 