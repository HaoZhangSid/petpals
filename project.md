# PetPals - A Pet Owner Connection Platform

## Overview
PetPals is a full-stack web application designed to connect pet owners based on their locations, pets, and shared interests. The platform helps pet owners find local companions for pet activities, arrange playdates, and build meaningful connections within their pet-loving community.

## The Situation
While pet ownership brings joy and companionship, many pet owners face challenges in finding like-minded individuals for pet-related activities. Whether it's finding a walking buddy for your dog, arranging cat playdates, or sharing experiences with fellow pet owners, making these connections can be difficult. PetPals aims to solve this problem by creating a dedicated platform for pet owners to connect.

## Functional Requirements

### Registration & Authentication
- Users can sign up with a unique email address and password
- Passwords must be securely hashed using bcrypt with salt
- JWT-based session management
- Logout functionality accessible from any page

### User and Pet Profiles
Users must complete both their profile and pet profile(s) before accessing recommendations:

#### User Profile
- Basic information (name, location, contact preferences)
- Pet ownership experience
- Activity preferences (walking, training, pet meetups)
- Profile picture
- About me section

#### Pet Profile(s)
- Pet name and type
- Age and breed
- Personality traits
- Pet photo
- Special needs or considerations
- Activity preferences
- Vaccination status

Users can manage multiple pet profiles and modify any profile information at any time.

### Location Services
- Users specify their location (city/neighborhood)
- Option to set maximum distance for connections
- Location-based filtering for recommendations
- Support for finding local pet-friendly venues and events

### Recommendations
- Maximum of 10 recommendations at a time
- Prioritized matching based on:
  - Location proximity
  - Pet compatibility (type, age, size)
  - Owner interests and schedules
  - Activity preferences
- Option to accept or dismiss recommendations
- Dismissed recommendations won't appear again

### Connections
- Send and receive connection requests
- Accept or decline incoming requests
- View connected users' profiles
- Manage existing connections
- Option to disconnect

### Chat System
- Real-time chat between connected users
- Chat history preservation
- Unread message notifications
- Most recent chats appear first
- Date/time stamps on messages
- Real-time updates without polling

### Events
- Create pet-friendly events
- Browse local pet events
- RSVP functionality
- Event categories (walks, training, meetups)
- Event capacity management

## Technical Requirements

### Backend
- Implemented in Go
- RESTful API design
- PostgreSQL database
- Secure authentication and authorization
- Real-time communication support

### Frontend
- Built with React
- Responsive design (mobile and desktop)
- Intuitive user interface
- Real-time updates

### API Endpoints
Must implement RESTful endpoints including:
- `/users/{id}` - Basic user info
- `/users/{id}/profile` - User profile details
- `/users/{id}/pets` - User's pet information
- `/me/*` - Authenticated user shortcuts
- `/recommendations` - Matching suggestions
- `/connections` - Connected users
- `/events` - Event management

### Security
- Secure password storage
- Protected private information
- Authorization checks
- Input validation
- XSS protection

## Optional Features
- Online/offline status indicators
- Typing indicators in chat
- GPS-based proximity matching
- Pet health reminder system
- Pet-sitter finding service
- Integration with local vet services
- Photo sharing capabilities

## Development Requirements
- Implement test data generation (minimum 100 users with pets)
- Database reset and reload functionality
- Documentation for setup and deployment
- Test coverage for critical features

## Success Criteria
- Functional user matching system
- Secure data handling
- Responsive design
- Real-time communication
- Intuitive user experience
- Scalable architecture

# PetPals Core Technical Stack

## Backend Core
- **Language**: Go
- **Web Framework**: Gin
- **Database**: PostgreSQL
- **ORM**: GORM
- **Authentication**: 
  - JWT
  - Bcrypt
- **Real-time**: Socket.IO (Go Server)
- **Image Storage**: AWS S3

## Frontend Core
- **Framework**: 
  - React
  - TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API Client**: Axios
- **Real-time**: Socket.IO Client

## Development Essentials
- **Version Control**: Git
- **Container**: Docker
- **API Documentation**: Swagger

## Security Essentials
- HTTPS/TLS
- CORS
- Input Validation
