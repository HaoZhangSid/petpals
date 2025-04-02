import { Conversation, Message, User } from '../types';

// Mock user data for conversations
const mockUsers: User[] = [
  {
    id: 'user-2',
    name: 'Mike',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    isOnline: true,
    petInfo: 'German Shepherd • 4 yrs',
    pets: []
  },
  {
    id: 'user-3',
    name: 'Lisa',
    email: 'lisa@example.com',
    avatar: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    isOnline: false,
    petInfo: 'Persian Cat • 2 yrs',
    pets: []
  },
  {
    id: 'user-4',
    name: 'Alex',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    isOnline: true,
    petInfo: 'Corgi • 1 yr',
    pets: []
  },
  {
    id: 'user-5',
    name: 'Sarah',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    isOnline: false,
    petInfo: 'Tabby Cat • 3 yrs',
    pets: []
  },
  {
    id: 'user-6',
    name: 'Jake',
    email: 'jake@example.com',
    avatar: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    isOnline: true,
    petInfo: 'Labrador • 2 yrs',
    pets: []
  },
  {
    id: 'user-7',
    name: 'Jessica',
    email: 'jessica@example.com',
    avatar: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    isOnline: false,
    petInfo: 'Beagle • 5 yrs',
    pets: []
  }
];

// Current user for reference
const currentUser: User = {
  id: 'current-user',
  name: 'Emma Johnson',
  email: 'emma.johnson@example.com',
  avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
  petInfo: 'Golden Retriever • 3 yrs',
  pets: []
};

// Mock messages for each conversation
const now = new Date();

// Conversation 1 - Mike & Rex
const conversation1Messages: Message[] = [
  {
    id: 'msg-1-1',
    content: "Hi Emma! How's Max doing?",
    senderId: mockUsers[0].id,
    timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), // 20 mins ago
    conversationId: 'conv-1',
    read: true,
    sender: mockUsers[0],
    createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString() // 20 mins ago
  },
  {
    id: 'msg-1-2',
    content: "Hey Mike! Max is doing great, thanks for asking! He's been really energetic lately.",
    senderId: currentUser.id,
    timestamp: new Date(now.getTime() - 17 * 60 * 1000).toISOString(), // 17 mins ago
    conversationId: 'conv-1',
    read: true,
    sender: currentUser,
    createdAt: new Date(now.getTime() - 17 * 60 * 1000).toISOString() // 17 mins ago
  },
  {
    id: 'msg-1-3',
    content: "That's awesome! Rex has been pretty active too. Would you like to meet up at the dog park this weekend? Rex has been eager to make new friends.",
    senderId: mockUsers[0].id,
    timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    conversationId: 'conv-1',
    read: true,
    sender: mockUsers[0],
    createdAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString() // 12 mins ago
  },
  {
    id: 'msg-1-4',
    content: "Here's Rex at the park last weekend. He loves the open space!",
    senderId: mockUsers[0].id,
    timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    conversationId: 'conv-1',
    read: true,
    sender: mockUsers[0],
    createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    image: 'https://images.unsplash.com/photo-1583511655826-05700442976e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80'
  },
  {
    id: 'msg-1-5',
    content: "He's so handsome! Max would definitely enjoy playing with him. This weekend sounds great! How about Saturday morning at Central Park Dog Run?",
    senderId: currentUser.id,
    timestamp: new Date(now.getTime() - 7 * 60 * 1000).toISOString(), // 7 mins ago
    conversationId: 'conv-1',
    read: true,
    sender: currentUser,
    createdAt: new Date(now.getTime() - 7 * 60 * 1000).toISOString() // 7 mins ago
  },
  {
    id: 'msg-1-6',
    content: "Here's Max with his favorite toy! He never goes to the park without it.",
    senderId: currentUser.id,
    timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    conversationId: 'conv-1',
    read: true,
    sender: currentUser,
    createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80'
  },
  {
    id: 'msg-1-7',
    content: "Great! Saturday morning works perfectly. Shall we say around 9 AM at Central Park? Rex is an early bird!",
    senderId: mockUsers[0].id,
    timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // 2 mins ago
    conversationId: 'conv-1',
    read: false,
    sender: mockUsers[0],
    createdAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString() // 2 mins ago
  }
];

// Conversation 2 - Lisa & Mittens
const conversation2Messages: Message[] = [
  {
    id: 'msg-2-1',
    content: "Hi Emma! How's Max doing with his new toy?",
    senderId: mockUsers[1].id,
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    conversationId: 'conv-2',
    read: true,
    sender: mockUsers[1],
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    id: 'msg-2-2',
    content: "He loves it! Thanks for the recommendation.",
    senderId: currentUser.id,
    timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours ago
    conversationId: 'conv-2',
    read: true,
    sender: currentUser,
    createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString() // 2.5 hours ago
  },
  {
    id: 'msg-2-3',
    content: "Mittens really enjoyed meeting Max last week! We should arrange another playdate soon.",
    senderId: mockUsers[1].id,
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    conversationId: 'conv-2',
    read: false,
    sender: mockUsers[1],
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
  }
];

// Conversation 3 - Alex & Coco
const conversation3Messages: Message[] = [
  {
    id: 'msg-3-1',
    content: "Hey Emma, do you know any good groomers for corgis? Coco needs a trim.",
    senderId: mockUsers[2].id,
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    conversationId: 'conv-3',
    read: true,
    sender: mockUsers[2],
    createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    id: 'msg-3-2',
    content: "Yes! I take Max to 'Pawsome Grooming' on Main Street. They're great with all breeds.",
    senderId: currentUser.id,
    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    conversationId: 'conv-3',
    read: true,
    sender: currentUser,
    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    id: 'msg-3-3',
    content: "Thanks! I'll check them out. Do they take appointments online?",
    senderId: mockUsers[2].id,
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    conversationId: 'conv-3',
    read: false,
    sender: mockUsers[2],
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  }
];

// Mock conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [mockUsers[0], currentUser],
    lastMessage: {
      content: conversation1Messages[conversation1Messages.length - 1].content,
      timestamp: conversation1Messages[conversation1Messages.length - 1].timestamp,
      senderId: conversation1Messages[conversation1Messages.length - 1].senderId,
      read: false,
      sender: mockUsers[0]
    },
    updatedAt: conversation1Messages[conversation1Messages.length - 1].timestamp,
    unreadCount: 1
  },
  {
    id: 'conv-2',
    participants: [mockUsers[1], currentUser],
    lastMessage: {
      content: conversation2Messages[conversation2Messages.length - 1].content,
      timestamp: conversation2Messages[conversation2Messages.length - 1].timestamp,
      senderId: conversation2Messages[conversation2Messages.length - 1].senderId,
      read: false,
      sender: mockUsers[1]
    },
    updatedAt: conversation2Messages[conversation2Messages.length - 1].timestamp,
    unreadCount: 1
  },
  {
    id: 'conv-3',
    participants: [mockUsers[2], currentUser],
    lastMessage: {
      content: conversation3Messages[conversation3Messages.length - 1].content,
      timestamp: conversation3Messages[conversation3Messages.length - 1].timestamp,
      senderId: conversation3Messages[conversation3Messages.length - 1].senderId,
      read: false,
      sender: mockUsers[2]
    },
    updatedAt: conversation3Messages[conversation3Messages.length - 1].timestamp,
    unreadCount: 1
  },
  {
    id: 'conv-4',
    participants: [mockUsers[3], currentUser],
    lastMessage: {
      content: "That pet-friendly cafe we went to was amazing! Thanks for the recommendation.",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      senderId: mockUsers[3].id,
      read: true,
      sender: mockUsers[3]
    },
    updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    unreadCount: 0
  },
  {
    id: 'conv-5',
    participants: [mockUsers[4], currentUser],
    lastMessage: {
      content: "I'm looking forward to our pet playdate next weekend! Buddy is excited too.",
      timestamp: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(), // Yesterday
      senderId: mockUsers[4].id,
      read: true,
      sender: mockUsers[4]
    },
    updatedAt: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(), // Yesterday
    unreadCount: 0
  },
  {
    id: 'conv-6',
    participants: [mockUsers[5], currentUser],
    lastMessage: {
      content: "Have you tried that new all-natural dog food brand? Lucy seems to really like it.",
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      senderId: mockUsers[5].id,
      read: true,
      sender: mockUsers[5]
    },
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    unreadCount: 0
  }
];

// Export message maps by conversation
export const mockChatMessages: { [key: string]: Message[] } = {
  'conv-1': conversation1Messages,
  'conv-2': conversation2Messages,
  'conv-3': conversation3Messages
};

// Export messages for API
export const mockMessages = [
  ...conversation1Messages,
  ...conversation2Messages,
  ...conversation3Messages
]; 