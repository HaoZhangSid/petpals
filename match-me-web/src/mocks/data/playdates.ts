import { Playdate, PlaydateCreator } from '../../types'; // Assuming types are in src/types

const mockUser1: PlaydateCreator = { id: 'user-123', name: 'You', avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1' };
const mockUser2: PlaydateCreator = { id: 'user-456', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e' };
const mockUser3: PlaydateCreator = { id: 'user-789', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8' };
const mockUser4: PlaydateCreator = { id: 'user-pub', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b' };


export const mockPlaydates: Playdate[] = [
  // 1. Event created by current user (private reminder)
  {
    id: "playdate-my-private",
    title: "Vet Appointment",
    date: "Friday",
    time: "3:00 PM",
    location: "Animal Hospital Downtown",
    creator: mockUser1,
    participants: [mockUser1],
    icon: "🏥",
    visibility: 'private',
    typeForCurrentUser: 'my_event', // Type for rendering
    statusForCurrentUser: 'accepted',
    createdAt: "2023-06-24T11:00:00Z"
  },
  // 2. Invitation received by current user
  {
    id: "playdate-invite-1",
    title: "Central Park Adventure",
    date: "Saturday",
    time: "9:00 AM",
    location: "Central Park Dog Run, Beijing",
    creator: mockUser2, // Created by Mike
    participants: [mockUser2], // Initially just Mike
    icon: "🏞️",
    visibility: 'invited_only', // Mike invited specifically
    typeForCurrentUser: 'invitation', // Type for rendering
    statusForCurrentUser: 'pending', // User hasn't responded yet
    description: "Take the dogs to the park to play, walk, and socialize.",
    createdAt: "2023-06-15T10:30:00Z"
  },
  // 3. Event created by friend, accepted by current user
  {
    id: "playdate-friend-accepted",
    title: "Pet-Friendly Cafe Meetup",
    date: "Wednesday",
    time: "2:00 PM",
    location: "Paws & Coffee, 123 Main St",
    creator: mockUser3, // Created by Sarah
    participants: [mockUser3, mockUser1], // Sarah and You are going
    icon: "☕",
    visibility: 'friends', // Visible to Sarah's friends
    typeForCurrentUser: 'friends_event', // Type for rendering (or maybe 'my_event' since accepted?) Let's use friends_event
    statusForCurrentUser: 'accepted', // User accepted
    description: "Meet up at a pet-friendly cafe and let the pets make new friends.",
    createdAt: "2023-06-16T14:20:00Z"
  },
   // 4. Nearby public event, user hasn't interacted yet
  {
    id: "playdate-public-nearby",
    title: "Corgi Meetup!",
    date: "Sunday",
    time: "11:00 AM",
    location: "Riverside Park (South End)",
    creator: mockUser4, // Created by Alex
    participants: [mockUser4], // Just Alex so far
    icon: "🐕",
    visibility: 'public',
    typeForCurrentUser: 'public_nearby', // Type for rendering
    statusForCurrentUser: undefined, // User hasn't joined or requested
    description: "Calling all Corgis and their humans for a fun morning!",
    allowsJoinRequests: true,
    createdAt: "2023-06-23T09:00:00Z"
  },
]; 