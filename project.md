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
- Basic information (name, location, contact preferences, email [read-only after registration])
- Pet ownership experience
- Activity preferences (walking, training, pet meetups)
- Profile picture (avatar)
- About me section (bio)

#### Pet Profile(s)
- Pet name and type
- Age and breed
- Personality traits (e.g., playful, calm, shy, energetic)
- Pet photo(s)
- Special needs or considerations
- Activity preferences
- Vaccination status (optional)

Users can manage multiple pet profiles and modify any profile information at any time.

### Location Services
- Users specify their location (city/neighborhood)
- Option to set maximum distance for connections (e.g., 5km, 10km, 25km)
- Location-based filtering for recommendations
- (Optional) Support for finding local pet-friendly venues and events

### Recommendations
- Maximum of 10 recommendations at a time
- Prioritized matching based on:
  - Location proximity (within user-defined distance)
  - Pet compatibility (e.g., similar type/size, energy level, complementary personality traits)
  - Owner interests and activity preferences
  - (Optional) Owner schedule availability
- Option to accept (initiating connection request) or dismiss recommendations
- Dismissed recommendations won't appear again for a defined period

### Connections
- Send connection requests (e.g., initiated from recommendations or user profiles)
- View incoming connection requests
- Accept or decline incoming requests
- View connected users' profiles (limited profile details?)
- Manage existing connections (view list, disconnect)

### Chat System
- Real-time chat between connected users
- Chat history preservation
- Unread message notifications
- List of recent chats, ordered by last message time
- Date/time stamps on messages
- (Optional) Typing indicators
- (Optional) Online/offline status indicators for connected users

### Events (Optional V2 Feature)
- Create pet-friendly events (location, time, description, category)
- Browse local pet events (filtered by location, date, category)
- RSVP functionality (attend/maybe/decline)
- View event attendees
- Event categories (walks, training, meetups, charity)
- Event capacity management

## Data Models (High-Level)

- **User**: `id`, `name`, `email`, `password_hash`, `location`, `bio`, `avatar_url`, `preferences` (e.g., activity types, distance), `created_at`, `updated_at`
- **Pet**: `id`, `owner_id` (FK to User), `name`, `type` (e.g., dog, cat), `breed`, `age`, `personality_traits` (array/tags), `photos_urls` (array), `special_needs`, `activity_preferences`, `created_at`, `updated_at`
- **Connection**: `id`, `user1_id` (FK to User), `user2_id` (FK to User), `status` (e.g., pending, accepted, declined, blocked), `requested_by` (user1 or user2), `created_at`, `updated_at`
- **Message**: `id`, `connection_id` (FK to Connection), `sender_id` (FK to User), `content`, `sent_at`, `read_status`
- **Recommendation**: (Likely transient, generated on demand, may not need a persistent table)
- **Event**: (If implemented) `id`, `creator_id` (FK to User), `title`, `description`, `location`, `start_time`, `end_time`, `category`, `capacity`, `created_at`
- **EventRSVP**: (If implemented) `id`, `event_id` (FK to Event), `user_id` (FK to User), `status` (attending, maybe, declined), `created_at`

## Technical Requirements

### Backend
- Implemented in Go
- RESTful API design
- PostgreSQL database
- Secure authentication and authorization
- Real-time communication support via WebSockets (e.g., using a library like Gorilla WebSocket or a framework-integrated solution)

### Frontend
- Built with React & TypeScript
- Responsive design (mobile and desktop)
- Intuitive user interface
- Real-time updates via WebSocket client

### API Endpoints (Examples - Subject to Refinement)
Defines RESTful endpoints for core resources. `/api/v1` prefix assumed.

**Authentication:**
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in user, returns JWT
- `POST /auth/logout` - (Optional: server-side token invalidation if needed)

**Current User (`/me`):**
- `GET /me` - Get current authenticated user's basic info
- `PATCH /me` - Update current authenticated user's basic info (name, location etc.)
- `GET /me/profile` - Get current user's detailed profile
- `PATCH /me/profile` - Update current user's detailed profile (bio, preferences etc.)
- `POST /me/avatar` - Upload/Update current user's avatar
- `GET /me/pets` - List current user's pets
- `POST /me/pets` - Add a new pet for the current user
- `GET /me/pets/{petId}` - Get details of a specific pet
- `PATCH /me/pets/{petId}` - Update a specific pet
- `DELETE /me/pets/{petId}` - Delete a specific pet
- `POST /me/pets/{petId}/photos` - Add photo(s) to a specific pet
- `DELETE /me/pets/{petId}/photos/{photoId}` - Remove a photo from a pet

**Other Users:**
- `GET /users/{userId}` - Get basic public info of another user
- `GET /users/{userId}/profile` - Get detailed public profile of another user
- `GET /users/{userId}/pets` - List public pets of another user

**Recommendations:**
- `GET /recommendations` - Get a list of user/pet recommendations
- `POST /recommendations/{recommendationId}/dismiss` - Dismiss a recommendation

**Connections:**
- `GET /connections` - List current user's connections (accepted status)
- `GET /connections/requests` - List incoming connection requests (pending status)
- `POST /connections` - Send a connection request (body: `{"targetUserId": "..."}`)
- `PUT /connections/requests/{requestId}` - Accept or decline a connection request (body: `{"action": "accept" | "decline"}`)
- `DELETE /connections/{connectionId}` - Remove an existing connection

**Chat:**
- `GET /chats` - List recent chat conversations (connections with messages)
- `GET /chats/{connectionId}/messages` - Get message history for a specific chat/connection
- `POST /chats/{connectionId}/messages` - Send a message (handled via WebSocket? REST for history?)

**Events (Optional V2):**
- `GET /events` - List upcoming/local events
- `POST /events` - Create a new event
- `GET /events/{eventId}` - Get details of a specific event
- `PATCH /events/{eventId}` - Update an event (if creator)
- `DELETE /events/{eventId}` - Delete an event (if creator)
- `POST /events/{eventId}/rsvp` - RSVP to an event (body: `{"status": "attending" | ...}`)
- `GET /events/{eventId}/attendees` - List users attending an event

**Static Files:**
- `/uploads/*` - Serves uploaded images (e.g., avatars, pet photos)

### Real-time Communication Scope (WebSockets)
- **Chat:** Sending/receiving messages in real-time.
- **Notifications:** Real-time delivery of new connection requests, new messages, potentially event updates.
- **Presence:** (Optional) Online/offline status indicators.
- **Typing Indicators:** (Optional) Showing when a connected user is typing in the chat.

### Security
- Secure password storage (bcrypt)
- Protected private information (authorization checks on all sensitive endpoints)
- Authorization checks (ensure user can only modify their own data, etc.)
- Input validation (backend and potentially frontend)
- Rate limiting on sensitive endpoints (login, register)
- HTTPS enforcement
- CORS configuration
- Protection against common web vulnerabilities (XSS, CSRF if using cookies)

## Optional Features (Beyond V1)
- GPS-based proximity matching (fine-grained location)
- Pet health reminder system
- Pet-sitter finding service
- Integration with local vet services
- Advanced photo sharing capabilities (albums, comments)
- User reviews/ratings for connections or events

## Development Requirements
- Implement test data generation (minimum 100 users with pets)
- Database seeding script (for initial data and reset)
- Documentation for setup, API usage (e.g., Swagger/OpenAPI), and deployment
- Test coverage for critical features (unit, integration tests)
- Consistent code style and linting

## Success Criteria
- Functional user matching system based on defined criteria
- Secure and private data handling
- Responsive and intuitive user interface across devices
- Real-time chat and notifications working reliably
- Scalable architecture to handle potential growth

# PetPals Core Technical Stack

## Backend Core
- **Language**: Go
- **Web Framework**: Gin (or another suitable Go framework like Echo, Chi)
- **Database**: PostgreSQL
- **ORM/Query Builder**: GORM (or sqlx, pgx for more control)
- **Authentication**: JWT (libraries like `golang-jwt/jwt`), Bcrypt
- **Real-time**: WebSocket library (e.g., Gorilla WebSocket)
- **Image Storage**: Local File System (served via a dedicated static route, e.g., `/uploads/*`)

## Frontend Core
- **Framework**: React, TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API Client**: Axios
- **Real-time**: WebSocket client (native browser API or libraries like `socket.io-client` if backend uses Socket.IO protocol)

## Development Essentials
- **Version Control**: Git
- **Containerization**: Docker, Docker Compose (for local development env)
- **API Documentation**: OpenAPI (Swagger) specification

## Security Essentials
- HTTPS/TLS
- CORS policy
- Input Validation (server-side is crucial)
- Environment variable management for secrets

# Development Checklist

This checklist tracks the development progress based on the defined requirements.

**Phase 1: Core Data Management**

*   **[DONE]** Frontend: User Profile display and basic edit form structure (`Profile.tsx`, `UserProfileInfo`, `UserProfileForm`).
*   **[DONE]** Frontend: User Photos display and basic edit form structure (`UserPhotosSection`, `UserPhotosForm`).
*   **[DONE]** Frontend: Pet Profile display (`MyPetsSection`) and basic add/edit form structure (`PetProfileForm`).
*   **[DONE]** Frontend: User state management for profile updates (`userStore.ts`).
*   **[DONE]** Frontend: Pet state management for CRUD operations (`petStore.ts`).
*   **[DONE]** Frontend: Basic API service setup (`api.ts`).
*   **[DONE]** Frontend: Image URL handling for locally served files.
*   **[IN PROGRESS]** Backend: User Profile update API (`PATCH /api/v1/me` or `/me/profile`) - Support all fields & avatar upload.
*   **[IN PROGRESS]** Backend: Pet Profile CRUD APIs (`/api/v1/pets/*` or `/me/pets/*`) - Support all fields & photo management.
*   **[ ] Backend:** Configure static file serving for `/uploads/*`.
*   **[ ] Database:** Write and test database seeding script.
*   **[ ] Testing:** End-to-end testing for User/Pet Profile CRUD operations (including images).

**Phase 2: Matching & Connections**

*   **[ ] Backend:** Implement recommendation logic & `GET /recommendations` API.
*   **[ ] Backend:** Implement Connection APIs (`POST /connections`, `GET /connections/requests`, `PUT /connections/requests/{requestId}`, `GET /connections`, `DELETE /connections/{connectionId}`).
*   **[ ] Backend:** Implement fine-grained authorization logic (e.g., profile visibility, pet ownership checks).
*   **[ ] Frontend:** Implement `Discover.tsx` page UI & logic (display recommendations, accept/dismiss).
*   **[ ] Frontend:** Implement `Connections.tsx` page UI & logic (display connections, manage requests).
*   **[ ] Testing:** Test recommendation generation and connection workflows.

**Phase 3: Communication Channel**

*   **[ ] Backend:** Implement WebSocket server basics (connection, auth, disconnect).
*   **[ ] Backend:** Implement REST APIs for chat history (`GET /chats`, `GET /chats/{connectionId}/messages`).
*   **[ ] Backend:** Implement WebSocket message handling (sending, receiving, broadcasting).
*   **[ ] Frontend:** Implement `Messages.tsx` chat UI.
*   **[ ] Frontend:** Integrate WebSocket client for real-time messaging.
*   **[ ] Frontend:** Implement loading chat list and history.
*   **[ ] Testing:** Test real-time chat functionality.

**Phase 4: Refinement & Testing**

*   **[ ] Testing:** Write comprehensive unit and integration tests for backend services.
*   **[ ] Testing:** Write frontend component tests.
*   **[ ] Frontend/Backend:** Implement real-time notifications (new messages, connection requests).
*   **[ ] Frontend:** Refine UI/UX across the application.
*   **[ ] Documentation:** Generate/update API documentation (Swagger/OpenAPI).
*   **[ ] Deployment:** Prepare for deployment (Dockerfiles, configuration).

**Optional Features (Post V1)**

*   **[ ]** Events System
*   **[ ]** GPS-based matching
*   **[ ]** Pet health reminders
*   **[ ]** Pet-sitter service
*   **[ ]** Vet integration
*   **[ ]** Advanced photo sharing
*   **[ ]** User reviews
