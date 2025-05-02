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
- Generates recommendations for a specific **pet** owned by the logged-in user, suggesting other nearby pets as potential playmates.
- Maximum of 10 recommendations returned.
- Filtering and Sorting logic:
  - **Mandatory Filter:** Recommended pets **must** be of the **same type** (e.g., cat for a cat) as the target pet.
  - **Mandatory Filter:** Recommended pets' owners **must** be within the user's defined distance radius (`max_recommendation_radius_km`).
  - **Mandatory Filter:** Excludes the user's own pets.
  - **Sorting Priority:**
    1.  Geographic Distance (`distance_meters`) - Ascending (Closest first).
    2.  Activity Level Similarity - Pets with activity levels numerically closest to the target pet's level are ranked higher (using stable sort to preserve distance order when similarity is equal).
- API endpoint is `GET /api/v1/pets/{petId}/recommendations`.

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

## Data Models (Based on Go Code)

Describes the primary data structures used in the application, reflecting the Go `internal/models` definitions after refactoring.

- **User** (`models/user.go`):
  - `ID` (uuid.UUID): Primary Key.
  - `Name` (string): User's full name.
  - `Email` (string): Unique email address.
  - `Password` (string): Hashed password (excluded from JSON output).
  - `Location` (string): User's location (e.g., city, neighborhood).
  - `Phone` (string): User's phone number.
  - `Bio` (string): User's 'About Me' description.
  - `Interests` (pq.StringArray): Array of user's interests.
  - `CreatedAt` (time.Time): Timestamp of creation.
  - `UpdatedAt` (time.Time): Timestamp of last update.
  - *Relationships*: `Pets` (has many `Pet`).
  - *Transient Fields (for API response)*:
    - `AvatarURL` (*string): URL of the primary photo (`Photo` where `IsPrimary=true`).
    - `PhotoURLs` ([]string): URLs of other photos (from `Photo` model, ordered).

- **Pet** (`models/pet.go`):
  - `ID` (uuid.UUID): Primary Key.
  - `UserID` (uuid.UUID): Foreign Key to `User` (Owner).
  - `Name` (string): Pet's name.
  - `Type` (string): Type of pet (e.g., "dog", "cat").
  - `Breed` (*string): Pet's breed.
  - `Gender` (*string): Pet's gender.
  - `Weight` (*float64): Pet's weight.
  - `Birthday` (*time.Time): Pet's date of birth (Age is calculated from this).
  - `Bio` (*string): Description or notes about the pet.
  - `Personality` (pq.StringArray): Array of personality traits (e.g., "playful", "calm").
  - `FavoriteActivities` (pq.StringArray): Array of pet's favorite activities.
  - `PlayStyle` (pq.StringArray): Array describing pet's play style.
  - `ActivityLevel` (*string): Pet's general activity level (e.g., "high", "medium", "low").
  - `IsMicrochipped` (*bool): Microchip status.
  - `IsVaccinated` (*bool): Vaccination status.
  - `IsNeutered` (*bool): Neutered/spayed status.
  - `CreatedAt` (time.Time): Timestamp of creation.
  - `UpdatedAt` (time.Time): Timestamp of last update.
  - `DeletedAt` (gorm.DeletedAt): Timestamp for soft delete.
  - *Relationships*: `User` (belongs to `User`).
  - *Transient Fields (for API response)*:
    - `AvatarURL` (*string): URL of the primary photo (`Photo` where `IsPrimary=true`).
    - `PhotoURLs` ([]string): URLs of other photos (from `Photo` model, ordered).

- **Photo** (`models/photo.go`):
  - `ID` (uuid.UUID): Primary Key.
  - `OwnerType` (string): Type of owner ("user" or "pet").
  - `OwnerID` (uuid.UUID): Foreign Key to the owner (User ID or Pet ID).
  - `URL` (string): URL path to the photo file (e.g., `/uploads/...`).
  - `IsPrimary` (bool): Indicates if this is the main profile/avatar photo.
  - `Order` (int): Used for sorting photos in a gallery.
  - `Caption` (string): Optional caption for the photo.
  - `CreatedAt` (time.Time).
  - `UpdatedAt` (time.Time).

- **Connection** (`models/connection.go`):
  - `ID` (uuid.UUID): Primary Key.
  - `RequesterID` (uuid.UUID): Foreign Key to `User` who initiated the connection.
  - `ReceiverID` (uuid.UUID): Foreign Key to `User` who received the request.
  - `Status` (string): Connection status (e.g., "pending", "accepted", "blocked").
  - `CreatedAt` (time.Time).
  - `UpdatedAt` (time.Time).

- **Conversation** (`models/message.go`):
  - `ID` (uuid.UUID): Primary Key.
  - `User1ID` (uuid.UUID): Foreign Key to `User`.
  - `User2ID` (uuid.UUID): Foreign Key to `User`.
  - `CreatedAt`, `UpdatedAt`, `DeletedAt`.
  - *Relationships*: `User1`, `User2`, `Messages` (has many `Message`).

- **Message** (`models/message.go`):
  - `ID` (uuid.UUID): Primary Key.
  - `ConversationID` (uuid.UUID): Foreign Key to `Conversation`.
  - `SenderID` (uuid.UUID): Foreign Key to `User`.
  - `Content` (string): Message text.
  - `Read` (bool): Read status.
  - `CreatedAt`, `UpdatedAt`, `DeletedAt`.
  - *Relationships*: `Conversation`, `Sender`.

- **UserUpdatePayload** (`models/user.go` - Used for `PATCH /me`):
  - `Name` (*string)
  - `Location` (*string)
  - `Phone` (*string)
  - `Bio` (*string)
  - `Interests` (*pq.StringArray): Replaces the entire list if provided.
  - *Note*: Photo updates are now handled by dedicated Photo endpoints (`POST /me/photos`, `DELETE /photos/{id}`, `PATCH /photos/{id}/primary`).

- **PetUpdatePayload** (`models/pet.go` - Used for `PUT /pets/:petId`):
  - `Name` (*string)
  - `Type` (*string)
  - `Breed` (*string)
  - `Gender` (*string)
  - `Weight` (*float64)
  - `Birthday` (*time.Time)
  - `Bio` (*string)
  - `Personality` (*pq.StringArray): Replaces entire list if provided.
  - `FavoriteActivities` (*pq.StringArray): Replaces entire list if provided.
  - `PlayStyle` (*pq.StringArray): Replaces entire list if provided.
  - `ActivityLevel` (*string)
  - `IsMicrochipped` (*bool)
  - `IsVaccinated` (*bool)
  - `IsNeutered` (*bool)
  - *Note*: Photo updates are now handled by dedicated Photo endpoints (`POST /pets/{petId}/photos`, `DELETE /photos/{id}`, `PATCH /photos/{id}/primary`).

- **Recommendation** (Placeholder - Likely transient, may not need a persistent table):
  - Data structure TBD based on recommendation logic implementation.

- **Event** (Placeholder - Optional V2 Feature):
  - `id`, `creator_id` (FK to User), `title`, `description`, `location`, `start_time`, `end_time`, `category`, `capacity`, `created_at`

- **EventRSVP** (Placeholder - Optional V2 Feature):
  - `id`, `event_id` (FK to Event), `user_id` (FK to User), `status` (attending, maybe, declined), `created_at`

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
- `GET /me/pets` - List current user's pets
- `POST /me/pets` - Add a new pet for the current user
- `GET /me/pets/{petId}` - Get details of a specific pet
- `PATCH /me/pets/{petId}` - Update a specific pet
- `DELETE /me/pets/{petId}` - Delete a specific pet
- `POST /me/photos` - Upload photo(s) for the current user (use form fields `photos`, `caption`, `isPrimary`). The first photo can be set as primary if `isPrimary=true`.
- `POST /me/pets/{petId}/photos` - Upload photo(s) for a specific pet (use form fields `photos`, `caption`, `isPrimary`). The first photo can be set as primary if `isPrimary=true`.

**Pets (Owned by current user & Public):**
- `GET /me/pets` - List current user's pets.
- `POST /me/pets` - Add a new pet for the current user.
- `GET /me/pets/{petId}` - Get details of a specific pet owned by the user.
- `PUT /me/pets/{petId}` - Update a specific pet owned by the user.
- `DELETE /me/pets/{petId}` - Delete a specific pet owned by the user.
- `POST /me/pets/{petId}/photos` - Upload photo(s) for a specific pet owned by the user.
- `GET /pets/{petId}/recommendations` - **(NEW)** Get potential playmate recommendations for a specific pet owned by the user. Filters by same type, owner distance, and sorts by distance then activity level similarity (max 10 results).
- `GET /pets/{petId}/photos` - List photos of a specific pet (public).

**Other Users (Public Views):**
- `GET /users/{userId}` - Get basic public info of another user
- `GET /users/{userId}/profile` - Get detailed public profile of another user
- `GET /users/{userId}/pets` - List public pets of another user

**Photos (Generic Actions):**
- `DELETE /photos/{photoId}` - Delete a specific photo (user or pet, requires ownership)
- `PATCH /photos/{photoId}/primary` - Set a specific photo as primary (requires ownership)
- `PATCH /photos/{photoId}` - (TODO) Update a photo's caption
- `PUT /owner/{ownerType}/{ownerId}/photos/order` - (TODO) Reorder photos for a user or pet

**Search/Discovery:**
- `GET /pets/search` - Search/filter pets based on various criteria (location, type, etc.)

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
*   **[DONE]** Frontend: Pet state management for CRUD operations (`petStore.ts` using `/me/pets`).
*   **[DONE]** Frontend: Basic API service setup (`api.ts`).
*   **[DONE]** Frontend: Image URL handling for locally served files.
*   **[DONE]** Backend: User Profile update API (`PATCH /api/v1/me`) - Supports updating user fields (Handler/Service/Repo implemented, route registered). User photo uploads are handled by `POST /api/v1/me/photos`.
*   **[DONE]** Backend: Pet Profile CRUD APIs (`POST /me/pets`, `GET /me/pets`, `GET /me/pets/:petId`, `PUT /me/pets/:petId`, `DELETE /me/pets/:petId`) - Supports managing pet fields (Handler/Service/Repo implemented, routes registered). Pet photo management is handled by `POST /me/pets/:petId/photos` and other `/api/v1/photos/*` endpoints.
*   **[DONE]** Backend: Photo management APIs (`POST /me/photos`, `POST /me/pets/:petId/photos`, `DELETE /photos/:photoId`, `PATCH /photos/:photoId/primary`) - (Handler/Service/Repo implemented, routes registered).
*   **[DONE]** Backend: Static file serving configured for `/uploads/*`.
*   **[DONE]** Backend: Implement `GET /api/v1/me/pets/:petId` endpoint.
*   **[DONE]** Database: Write and test database seeding script.
*   **[ ]** Testing: End-to-end testing for User/Pet Profile CRUD operations (including images, edge cases, validation).
*   **[DONE]** Backend: Move `GET /api/v1/me` logic from `main.go` to `user_handler.go`.
*   **[DONE]** Backend/Frontend: Align Pet API paths to `/me/pets/*` instead of `/api/v1/pets/*`.

**Phase 2: Matching & Connections**

*   **[DONE]** Backend: Implement **Pet-Specific Recommendation** logic & `GET /pets/{petId}/recommendations` API (based on owner proximity, limit 10).
*   **[DONE]** Backend: Enhance pet recommendation filtering/sorting (mandatory same type, sort by distance then activity level similarity).
*   **[ ] Backend:** Implement **Pet Search/Filter** logic & **`GET /pets/search`** API for the Discover page (supporting various filters like location/distance, type, breed, activity, etc., with pagination).
*   **[DONE]** Backend: Implement Connection APIs (`POST /connections`, `GET /connections/requests`, `PUT /connections/requests/{requestId}`, `GET /connections`, `DELETE /connections/{connectionId}`).
*   **[DONE - Basic]** Backend: Implement basic authorization logic (Profile: public view; Pet: owner modify).
*   **[ ] Frontend:** Implement **Discover Page (`Discover.tsx`)** UI & logic for **searching/filtering** pets (using the new `GET /pets/search` API).
*   **[ ] Frontend:** Implement **display of Recommendations** within the user's pet profile view (fetching from `GET /pets/{petId}/recommendations`).
*   **[ ] Frontend:** Implement `Connections.tsx` page UI & logic (display connections, manage requests).
*   **[ ] Testing:** Test pet recommendation generation and connection workflows.
*   **[ ] Testing:** Test pet search/filtering functionality.

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
