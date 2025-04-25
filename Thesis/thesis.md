# 4 Practical Part

This chapter details the practical implementation of the PetPals web application prototype. It outlines the technical architecture, the development process for key backend and frontend components, and the solutions applied to address specific technical challenges encountered during the project. The implementation directly applies the foundational technologies and methodologies discussed in previous chapters to achieve the project's core objectives.

## 4.1 System Architecture Overview

The PetPals application is built upon a client-server architecture, separating the user interface (frontend) from the application logic and data storage (backend). The frontend, developed using React and TypeScript, communicates with the backend primarily through a RESTful API. Real-time features, such as chat, utilize WebSocket communication managed via Socket.IO. The backend service is implemented in Go using the Gin web framework, and data persistence is handled by a PostgreSQL database accessed through the GORM library. This separation facilitates modular development, testing, and potential scaling of different system parts independently.

![Flowchart](./flowchart.png)
*Figure X: PetPals High-Level System Architecture* (Note: Replace X with the actual figure number and update the image path/caption as needed)

## 4.2 Backend System Implementation

The backend is responsible for managing application data, enforcing business logic, handling user authentication, and serving the API endpoints consumed by the frontend.

### 4.2.1 Data Persistence Layer

The foundation of the backend's data management relies on PostgreSQL. The structure of the data is defined using Go structs within the `models` package, representing entities such as Users and Pets. These models include field definitions, data types, constraints (like `not null`), and relationships (e.g., a User having multiple Pets). GORM, an Object-Relational Mapper, translates these Go structs into database tables and facilitates interaction with the database. Database schema changes are managed through [mention the migration approach used, e.g., manual SQL scripts, a migration tool like golang-migrate, or if GORM's AutoMigrate was used initially and then stopped].

To abstract database operations from the core application logic, the repository pattern was employed. Interfaces defining data access methods (e.g., `GetUserByID`, `CreatePet`, `UpdatePet`) were created in the `repository` package. Concrete implementations, specifically for PostgreSQL using GORM, provide the logic for these database interactions, handling tasks like constructing queries and managing database connections.

### 4.2.2 API and Business Logic Layer

The Gin web framework forms the core of the backend's API layer. API endpoints are organized into logical groups, such as `/auth` for public authentication routes (registration, login) and `/api/v1` for protected routes requiring user authentication. Routing rules map incoming HTTP requests (e.g., `POST /auth/register`, `PUT /api/v1/pets/:petId`) to specific handler functions within the `handlers` package.

Handler functions are responsible for parsing incoming requests, validating data, and orchestrating responses. This includes processing different content types, notably `multipart/form-data` for requests involving file uploads (like pet avatars and photos). Input validation ensures data integrity before further processing. Handlers interact with the service layer to execute business logic. Middleware, such as the custom `AuthMiddleware`, intercepts requests to protected endpoints, validates JWTs found in the `Authorization` header, and injects authenticated user information into the request context for subsequent use by handlers and services.

The `service` layer encapsulates the application's core business rules. For example, the `AuthService` handles user registration complexity, including password hashing using Bcrypt and JWT generation upon successful login. The `PetService` manages logic related to pet profiles, such as ensuring only the owner can modify or delete a pet, and implementing the specific logic for updating pet information, including handling the replacement and appending of photo URLs based on data received from the handler.

File storage is managed by a dedicated `filestorage` component. The current implementation uses local file system storage. It handles saving uploaded files (like images) with unique names (e.g., UUID-based), storing them in a configured directory (`./uploads`), and providing relative URL paths (e.g., `/uploads/filename.jpg`) that the frontend can use (combined with the API base URL) to access the files via the static file server configured in Gin.

### 4.2.3 Real-time Communication Layer (Optional Section)

[If Socket.IO for chat or other real-time features was significantly implemented, describe it here. Otherwise, this section can be omitted or kept brief.]
Real-time communication is facilitated using Socket.IO. The backend Go application integrates a Socket.IO server instance. This server manages WebSocket connections from clients, handles events like joining chat rooms or sending messages, and broadcasts events to relevant connected clients to enable features like live chat updates.

## 4.3 Frontend System Implementation

The frontend provides the user interface and interacts with the backend API to display data and submit user actions. It is built as a single-page application (SPA) using React.

### 4.3.1 Application Structure and Core Libraries

The frontend codebase, written in TypeScript for enhanced type safety, is organized into components, stores, services, and type definitions. React serves as the fundamental library for building the UI declaratively through components. Zustand is employed for managing global application state, while Axios handles HTTP communication with the backend API. Tailwind CSS is used for styling, following a utility-first approach to create the user interface design directly within the JSX markup.

### 4.3.2 Component Design and UI Implementation

The user interface is composed of reusable React components located primarily within the `components` directory (e.g., `components/profile`, `components/common`). Key components include:
*   `Profile.tsx`: Displays the main user and pet profile view, fetches data, manages the display of different sections, and handles user interactions like initiating edits or selecting pets.
*   `PetProfileForm.tsx`: A multi-step form component used for both creating and editing pet profiles. It manages local form state, handles user input for various fields (text, numbers, dates, checkboxes, file uploads), validates input, and prepares data for submission.
*   `Lightbox.tsx`: A common component used to display images in a full-screen overlay, supporting navigation between multiple images and keyboard controls.

Components manage their own local state where appropriate (e.g., form input values) using React's `useState` hook. User interactions trigger event handlers (e.g., `onClick`, `onChange`) which update component state or invoke actions defined in the state management stores. Tailwind CSS utility classes are applied directly to JSX elements to control layout, typography, colors, and responsiveness.

### 4.3.3 State Management

Global application state, such as the logged-in user's information, the list of the user's pets, and loading/error statuses, is managed using Zustand. Separate stores (`userStore`, `petStore`) are defined to hold related state slices and associated actions. Actions within the stores (e.g., `fetchPets`, `updateUser`, `updatePet`) encapsulate the logic for interacting with the backend API (via Axios) and updating the state immutably using Zustand's `set` function. React components subscribe to these stores using hooks provided by Zustand, ensuring the UI automatically re-renders when relevant global state changes.

### 4.3.4 API Interaction

Frontend communication with the backend REST API is handled primarily through a centralized Axios instance configured in the `services/api.ts` module. This instance may include base URL configuration and interceptors for tasks like automatically attaching the JWT authentication token to outgoing requests. Components or state store actions use this Axios instance to make asynchronous HTTP requests (GET, POST, PUT, DELETE). For operations involving file uploads, such as creating or updating pet profiles, `FormData` objects are constructed within the relevant component (`PetProfileForm`) and passed through the submission handlers (`handleAddPet`, `handleSavePetProfile`) to the state store actions (`updatePet`) or context handlers, which then send the `FormData` using Axios. Axios automatically sets the appropriate `Content-Type: multipart/form-data` header when sending `FormData`.

### 4.3.5 Real-time Communication (Optional Section)

[If Socket.IO was implemented on the frontend, describe it here.]
The frontend connects to the backend Socket.IO server to enable real-time features. It uses the Socket.IO client library to establish the connection, emit events (e.g., sending a chat message), and listen for events broadcast by the server (e.g., receiving a new message). Upon receiving events, frontend components update their state or trigger actions to reflect the real-time changes in the UI.

## 4.4 Addressing Key Implementation Challenges

During the development of the PetPals prototype, several technical challenges were encountered and addressed:

*   **Database Type Mismatches:** Initial discrepancies arose between Go model types and PostgreSQL column types, requiring careful schema definition and database adjustments.
*   **File Upload Handling:** Implementing robust file uploads involved configuring backend request limits, parsing `multipart/form-data`, managing server-side saving (`filestorage`), constructing `FormData` on the frontend, and handling single versus multiple file fields.
*   **Form Data Submission for Updates:** Ensuring correct pet profile updates, especially regarding photo management (appending new, removing existing, clearing all), required coordinated logic across the frontend form, backend handler, and service layer, including using explicit signals for empty lists.
*   **API Method Consistency:** Resolving 404 errors caused by mismatches between frontend API call methods (e.g., `PUT`) and backend route registrations (e.g., `PATCH`) required aligning both ends.
*   **Input Value Formatting:** Adjusting frontend code to format data (like dates into `YYYY-MM-DD`) to match the requirements of standard HTML input elements was necessary for correct display and interaction.
*   **UI Styling Consistency:** Applying consistent Tailwind CSS classes across various form inputs and elements required identifying and rectifying initial omissions.
*   **Image URL Resolution:** Frontend components needed logic to prepend the API base URL to relative image paths (`/uploads/...`) returned by the backend to construct valid `src` URLs for display.
*   **Lightbox Implementation:** Integrating an image lightbox involved creating a reusable component, managing its visibility state, handling image URL construction, binding trigger events, and refining animations.

Addressing these challenges involved debugging, code refactoring on both frontend and backend, careful state management, and ensuring correct data flow and format consistency between the client and server.

## 4.5 Summary of Implementation

This chapter detailed the practical construction of the PetPals web application prototype. It described the implementation of the backend system using Go, Gin, GORM, and PostgreSQL, covering data persistence, API handling, business logic, and file storage. It also outlined the frontend development using React, TypeScript, Zustand, and Tailwind CSS, focusing on component structure, state management, API interaction, and UI rendering. Key technical challenges encountered during development, related to data handling, file uploads, API consistency, and UI details, were presented along with the implemented solutions. The resulting application provides the core functionalities defined in the project goals, demonstrating the integration of the chosen technology stack. The effectiveness and outcomes of this implementation are further discussed in the following chapter.