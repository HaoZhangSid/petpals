import { Activity, User, Pet } from '../types';

// Sample user data with required pets field
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

// Sample pet data
const pets: Pet[] = [
  {
    id: 'pet1',
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    personality: ['Friendly', 'Playful'],
    bio: 'Friendly Golden Retriever who loves to play',
    distance: 0,
    lastActive: new Date().toISOString(),
    ownerName: 'Emma Johnson',
    ownerId: 'current-user',
    ownerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    activityLevel: 'Active',
    playStyle: ['Fetch', 'Running'],
    location: 'San Francisco, CA',
    weight: 65,
    birthday: '2021-03-15',
    isMicrochipped: true,
    isVaccinated: true,
    isNeutered: true,
    favoriteActivities: ['Fetch', 'Swimming'],
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    gender: 'Male'
  },
  {
    id: 'pet2',
    name: 'Rex',
    type: 'Dog',
    breed: 'German Shepherd',
    age: 4,
    avatar: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    personality: ['Loyal', 'Protective'],
    bio: 'Loyal German Shepherd looking for active playmates',
    distance: 2.5,
    lastActive: new Date().toISOString(),
    ownerName: 'Mike Wilson',
    ownerId: 'user1',
    ownerImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    activityLevel: 'Very Active',
    playStyle: ['Running', 'Fetch', 'Training'],
    location: 'San Francisco, CA',
    weight: 75,
    birthday: '2020-05-20',
    isMicrochipped: true,
    isVaccinated: true,
    isNeutered: true,
    favoriteActivities: ['Training', 'Running'],
    photos: [
      'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    gender: 'Male'
  },
  {
    id: 'pet3',
    name: 'Mittens',
    type: 'Cat',
    breed: 'Persian Cat',
    age: 2,
    avatar: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    personality: ['Calm', 'Affectionate'],
    bio: 'Sweet Persian cat who loves gentle play',
    distance: 3.1,
    lastActive: new Date().toISOString(),
    ownerName: 'Lisa Chen',
    ownerId: 'user2',
    ownerImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    activityLevel: 'Low Energy',
    playStyle: ['Laser Pointer', 'String Play'],
    location: 'San Francisco, CA',
    weight: 8,
    birthday: '2022-01-15',
    isMicrochipped: true,
    isVaccinated: true,
    isNeutered: true,
    favoriteActivities: ['Napping', 'Window Watching'],
    photos: [
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    gender: 'Female'
  }
];

// Sample activities data
export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    type: 'like',
    actor: users[0],
    targetPet: pets[0],
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: 'activity-2',
    type: 'connection_request',
    actor: users[1],
    target: users[7], // current user
    content: 'Would love to connect and arrange a playdate!',
    createdAt: new Date().toISOString(),
    status: 'pending',
    read: false
  },
  {
    id: 'activity-3',
    type: 'profile_view',
    actor: users[2],
    target: users[7], // current user
    createdAt: new Date().toISOString(),
    read: true
  },
  {
    id: 'activity-4',
    type: 'photo_added',
    actor: users[3],
    targetPet: pets[0],
    content: 'Added a new photo of Max playing in the park',
    createdAt: new Date().toISOString(),
    read: true
  },
  {
    id: 'activity-5',
    type: 'playdate_invitation',
    actor: users[4],
    target: users[7], // current user
    content: 'Would you like to meet at Central Park this weekend?',
    createdAt: new Date().toISOString(),
    status: 'pending',
    read: false
  }
]; 