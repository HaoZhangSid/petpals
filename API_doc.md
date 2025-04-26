# PetPals API Documentation

This document outlines the RESTful API endpoints for the PetPals backend.

**Base URL:** `/api/v1` (All endpoints listed below are relative to this base URL)

**Authentication:** Most endpoints require a valid JWT token passed in the `Authorization: Bearer <token>` header. Endpoints requiring authentication are marked with "(Auth Required)".

---

## Authentication

### `POST /auth/register`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "yoursecurepassword"
  }
  ```
- **Response (201 Created):** User object (excluding password).
  ```json
  {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "location": null,
    "phone": null,
    "bio": null,
    "interests": null,
    "avatarUrl": null,
    "photoUrls": [],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Response (400 Bad Request):** Validation errors (e.g., missing fields, invalid email, email already exists).
- **Notes:** Password is automatically hashed using bcrypt.

### `POST /auth/login`
- **Description:** Logs in an existing user.
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "yoursecurepassword"
  }
  ```
- **Response (200 OK):** JWT token.
  ```json
  {
    "token": "jwt-token-string"
  }
  ```
- **Response (400 Bad Request):** Missing fields.
- **Response (401 Unauthorized):** Invalid email or password.

---

## Current User (`/me`)

**(Auth Required)**

### `GET /me`
- **Description:** Retrieves the basic profile information of the currently authenticated user.
- **Response (200 OK):** User object (excluding password).
  ```json
  {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "location": "Cityville",
    "phone": "123-456-7890",
    "bio": "Loves dogs and hiking.",
    "interests": ["hiking", "reading"],
    "avatarUrl": "/uploads/user/uuid/avatar.jpg",
    "photoUrls": ["/uploads/user/uuid/photo1.jpg"],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

### `PATCH /me`
- **Description:** Updates the basic profile information of the currently authenticated user. Only include fields to be updated.
- **Request Body (Example):**
  ```json
  {
    "name": "Johnny Doe",
    "location": "New City",
    "phone": "987-654-3210",
    "bio": "Updated bio.",
    "interests": ["hiking", "coding", "pets"] // Replaces the entire interests array
  }
  ```
- **Response (200 OK):** Updated User object.
- **Response (400 Bad Request):** Validation errors.
- **Notes:** Email cannot be updated here. Photo updates are handled separately.

### `POST /me/photos`
- **Description:** Uploads one or more photos for the current user. Uses `multipart/form-data`.
- **Form Fields:**
    - `photos`: One or more image files.
    - `caption` (optional): Caption for the photo(s).
    - `isPrimary` (optional, boolean): If `true`, sets the *first* uploaded photo as the primary avatar.
- **Response (201 Created):** Array of created Photo objects.
  ```json
  [
    {
      "id": "uuid-string",
      "ownerType": "user",
      "ownerId": "user-uuid",
      "url": "/uploads/user/user-uuid/filename.jpg",
      "isPrimary": true,
      "order": 0,
      "caption": "My new avatar",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    // ... more photos if multiple uploaded
  ]
  ```
- **Response (400 Bad Request):** No files, invalid file type, etc.

---

## Pets (`/me/pets`)

**(Auth Required)**

### `GET /me/pets`
- **Description:** Lists all pets belonging to the currently authenticated user.
- **Response (200 OK):** Array of Pet objects.
  ```json
  [
    {
      "id": "pet-uuid-string",
      "userId": "user-uuid-string",
      "name": "Buddy",
      "type": "dog",
      "breed": "Golden Retriever",
      "gender": "male",
      "weight": 30.5,
      "birthday": "timestamp",
      "bio": "Friendly and loves fetch.",
      "personality": ["friendly", "playful"],
      "favoriteActivities": ["fetch", "swimming"],
      "playStyle": ["gentle"],
      "activityLevel": "high",
      "isMicrochipped": true,
      "isVaccinated": true,
      "isNeutered": true,
      "avatarUrl": "/uploads/pet/pet-uuid/avatar.jpg",
      "photoUrls": ["/uploads/pet/pet-uuid/photo1.jpg"],
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    // ... more pets
  ]
  ```

### `POST /me/pets`
- **Description:** Adds a new pet for the currently authenticated user.
- **Request Body:** (Minimum required fields: `name`, `type`)
  ```json
  {
    "name": "Whiskers",
    "type": "cat",
    "breed": "Siamese",
    "gender": "female",
    "birthday": "iso8601-date-string",
    // ... other optional pet fields
  }
  ```
- **Response (201 Created):** Created Pet object (without photos initially).
- **Response (400 Bad Request):** Validation errors (e.g., missing name or type).
- **Notes:** `UserID` is automatically set to the current user.

### `GET /me/pets/{petId}`
- **Description:** Retrieves details of a specific pet belonging to the current user.
- **Path Parameters:**
    - `petId` (UUID): The ID of the pet to retrieve.
- **Response (200 OK):** Pet object.
- **Response (404 Not Found):** Pet not found or doesn't belong to the user.

### `PUT /me/pets/{petId}`
- **Description:** Updates details of a specific pet belonging to the current user. Use `PUT` for full replacement semantics (though implemented like `PATCH` via payload struct).
- **Path Parameters:**
    - `petId` (UUID): The ID of the pet to update.
- **Request Body:** `PetUpdatePayload` (Include only fields to update). See `project.md` for fields. Example:
  ```json
  {
    "name": "Buddy II",
    "weight": 31.0,
    "personality": ["friendly", "playful", "energetic"] // Replaces entire array
  }
  ```
- **Response (200 OK):** Updated Pet object.
- **Response (400 Bad Request):** Validation errors.
- **Response (401 Unauthorized):** User does not own this pet.
- **Response (404 Not Found):** Pet not found.
- **Notes:** Photo updates are handled separately.

### `DELETE /me/pets/{petId}`
- **Description:** Deletes a specific pet belonging to the current user.
- **Path Parameters:**
    - `petId` (UUID): The ID of the pet to delete.
- **Response (204 No Content):** Success.
- **Response (401 Unauthorized):** User does not own this pet.
- **Response (404 Not Found):** Pet not found.

### `POST /me/pets/{petId}/photos`
- **Description:** Uploads one or more photos for a specific pet belonging to the current user. Uses `multipart/form-data`.
- **Path Parameters:**
    - `petId` (UUID): The ID of the pet to add photos to.
- **Form Fields:**
    - `photos`: One or more image files.
    - `caption` (optional): Caption for the photo(s).
    - `isPrimary` (optional, boolean): If `true`, sets the *first* uploaded photo as the primary avatar for this pet.
- **Response (201 Created):** Array of created Photo objects.
  ```json
  [
    {
      "id": "photo-uuid",
      "ownerType": "pet",
      "ownerId": "pet-uuid",
      "url": "/uploads/pet/pet-uuid/filename.jpg",
      "isPrimary": false,
      "order": 1,
      "caption": "Buddy playing",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
  ```
- **Response (400 Bad Request):** No files, invalid file type, etc.
- **Response (401 Unauthorized):** User does not own this pet.
- **Response (404 Not Found):** Pet not found.

---

## Photos

**(Auth Required for actions)**

### `DELETE /photos/{photoId}`
- **Description:** Deletes a specific photo belonging to the current user (either a user photo or a pet photo).
- **Path Parameters:**
    - `photoId` (UUID): The ID of the photo to delete.
- **Response (204 No Content):** Success.
- **Response (401 Unauthorized):** User does not own the photo (or the pet owner of the photo).
- **Response (404 Not Found):** Photo not found.

### `PATCH /photos/{photoId}/primary`
- **Description:** Sets a specific photo as the primary avatar for its owner (User or Pet). Automatically unsets previous primary photo for that owner.
- **Path Parameters:**
    - `photoId` (UUID): The ID of the photo to set as primary.
- **Response (200 OK):** Updated Photo object.
  ```json
  {
    "id": "photo-uuid",
    "ownerType": "pet", // or "user"
    "ownerId": "owner-uuid",
    "url": "/uploads/...",
    "isPrimary": true, // Will now be true
    "order": 0, // May be updated
    "caption": "...",
    "createdAt": "timestamp",
    "updatedAt": "timestamp" // Updated
  }
  ```
- **Response (401 Unauthorized):** User does not own the photo.
- **Response (404 Not Found):** Photo not found.

---

## Public Profiles (Read-Only)

### `GET /users/{userId}`
- **Description:** Retrieves basic public profile information of a specific user.
- **Path Parameters:**
    - `userId` (UUID): The ID of the user to retrieve.
- **Response (200 OK):** User object (excluding sensitive info like email, password, phone).
  ```json
   {
    "id": "user-uuid",
    "name": "Jane Doe",
    "location": "Cityville",
    "bio": "Loves cats.",
    "interests": ["reading", "cats"],
    "avatarUrl": "/uploads/user/user-uuid/avatar.jpg",
    "photoUrls": ["/uploads/user/user-uuid/photo1.jpg"],
    "createdAt": "timestamp" // May or may not be included depending on policy
  }
  ```
- **Response (404 Not Found):** User not found.

### `GET /users/{userId}/pets`
- **Description:** Lists the public pets of a specific user.
- **Path Parameters:**
    - `userId` (UUID): The ID of the user whose pets to list.
- **Response (200 OK):** Array of Pet objects (potentially slightly redacted compared to `/me/pets`).
- **Response (404 Not Found):** User not found.

### `GET /pets/{petId}/photos`
- **Description:** Lists the photos associated with a specific pet (publicly viewable).
- **Path Parameters:**
    - `petId` (UUID): The ID of the pet whose photos to list.
- **Response (200 OK):** Array of Photo objects.
- **Response (404 Not Found):** Pet not found.

---

## Recommendations

**(Auth Required)**

### `GET /recommendations`
- **Description:** Retrieves a list of potential connection recommendations for the current user. Excludes self and existing connections. Limited to 10 results.
- **Response (200 OK):** Array of recommendation objects (structure TBD, likely simplified User/Pet info). Example:
  ```json
  [
    {
      "userId": "recommended-user-uuid",
      "userName": "Jane Doe",
      "userAvatarUrl": "/uploads/...",
      "userLocation": "Cityville",
      "pets": [
        {
           "petId": "recommended-pet-uuid",
           "petName": "Fluffy",
           "petType": "cat",
           "petAvatarUrl": "/uploads/..."
           // ... other relevant matching info?
        }
      ],
      "matchScore": 0.85 // Example, actual implementation might differ
    }
    // ... up to 10 recommendations
  ]
  ```
- **Notes:** The exact recommendation logic and response structure might evolve.

---

## Connections

**(Auth Required)**

### `GET /connections`
- **Description:** Lists all accepted connections for the current user.
- **Response (200 OK):** Array of Connection objects where status is 'accepted' and the current user is either requester or receiver.
  ```json
  [
    {
      "id": "connection-uuid",
      "requesterId": "user-uuid-1",
      "receiverId": "user-uuid-2", // Could be current user
      "status": "accepted",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
      // Maybe include basic info of the other user? TBD
    }
  ]
  ```

### `GET /connections/requests`
- **Description:** Lists all incoming pending connection requests for the current user.
- **Response (200 OK):** Array of Connection objects where status is 'pending' and the current user is the receiver.
  ```json
  [
    {
      "id": "request-uuid",
      "requesterId": "other-user-uuid", // Info about requester needed here
      "receiverId": "current-user-uuid",
      "status": "pending",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
      // Include basic info of the requester? TBD
    }
  ]
  ```

### `POST /connections`
- **Description:** Sends a connection request from the current user to another user.
- **Request Body:**
  ```json
  {
    "targetUserId": "receiver-user-uuid"
  }
  ```
- **Response (201 Created):** Created Connection object with 'pending' status.
- **Response (400 Bad Request):** Missing `targetUserId`, trying to connect to self.
- **Response (404 Not Found):** Target user not found.
- **Response (409 Conflict):** Connection already exists (pending, accepted, or blocked).

### `PUT /connections/requests/{requestId}`
- **Description:** Accepts or declines an incoming connection request.
- **Path Parameters:**
    - `requestId` (UUID): The ID of the connection request (which is a Connection ID).
- **Request Body:**
  ```json
  {
    "action": "accept" // or "decline"
  }
  ```
- **Response (200 OK):** Updated Connection object (if accepted).
- **Response (204 No Content):** Success (if declined).
- **Response (400 Bad Request):** Invalid action.
- **Response (401 Unauthorized):** Current user is not the receiver of the request.
- **Response (404 Not Found):** Request not found.
- **Response (409 Conflict):** Request is not in 'pending' state.

### `DELETE /connections/{connectionId}`
- **Description:** Removes an existing accepted connection between the current user and another user.
- **Path Parameters:**
    - `connectionId` (UUID): The ID of the connection to remove.
- **Response (204 No Content):** Success.
- **Response (401 Unauthorized):** User is not part of this connection.
- **Response (404 Not Found):** Connection not found.
- **Response (409 Conflict):** Connection is not in 'accepted' state.

---

## Chat

**(Auth Required - Details TBD, likely WebSocket heavy)**

### `GET /chats`
- **Description:** (Planned) Lists recent chat conversations for the current user.
- **Response (200 OK):** (Planned) Array of conversation summaries (e.g., other user info, last message snippet, timestamp).

### `GET /chats/{connectionId}/messages`
- **Description:** (Planned) Retrieves message history for a specific connection/chat. Likely supports pagination.
- **Path Parameters:**
    - `connectionId` (UUID): The ID of the connection representing the chat.
- **Response (200 OK):** (Planned) Array of Message objects.

### WebSocket Endpoint (`/ws`)
- **Description:** (Planned) Handles real-time sending/receiving of chat messages and notifications after authentication. Protocol details TBD.

---

## Static Files

### `/uploads/*`
- **Description:** Serves uploaded user and pet photos. Access control might be needed depending on privacy settings (currently public). Example: `/uploads/pet/pet-uuid/filename.jpg`.
