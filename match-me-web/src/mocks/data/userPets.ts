import { Pet } from '../../types';

export const mockUserPets: Pet[] = [
  {
    id: 'pet-1',
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    avatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80',
    personality: ['Friendly', 'Energetic', 'Playful', 'Social', 'Loves water'],
    bio: "Max is a friendly and energetic Golden Retriever who loves going on adventures!",
    distance: 0,
    lastActive: new Date().toISOString(),
    ownerName: 'Emma Johnson',
    ownerId: 'user-1',
    ownerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    activityLevel: 'Active',
    playStyle: ['Beach Outings', 'Fetch', 'Hiking', 'Dog Park'],
    location: 'San Francisco, CA',
    weight: 75,
    birthday: '2021-03-15',
    isMicrochipped: true,
    isVaccinated: true,
    isNeutered: true,
    favoriteActivities: ['Swimming', 'Fetch'],
    photos: [
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80'
    ],
    gender: 'Male'
  },
  {
    id: 'pet-2',
    name: 'Luna',
    type: 'Cat',
    breed: 'Maine Coon',
    age: 2,
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80',
    personality: ['Calm', 'Affectionate', 'Independent', 'Curious'],
    bio: "Luna is a gentle giant who loves cuddling and watching birds from the window.",
    distance: 0,
    lastActive: new Date().toISOString(),
    ownerName: 'Emma Johnson',
    ownerId: 'user-1',
    ownerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    activityLevel: 'Moderate',
    playStyle: ['Indoor Play', 'Window Watching', 'Cuddling'],
    location: 'San Francisco, CA',
    weight: 12,
    birthday: '2022-01-15',
    isMicrochipped: true,
    isVaccinated: true,
    isNeutered: true,
    favoriteActivities: ['Window Watching', 'Cuddling'],
    photos: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80'
    ],
    gender: 'Female'
  }
]; 