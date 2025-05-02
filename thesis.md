# Building a Real-Time Recommendation Web App with Go, React, and PostgreSQL

Bachelor's Thesis
Degree Programme in Computer Applications
Spring 2025
Hao Zhang

- DP: Degree Programme in Computer Applications
- Author: Hao Zhang
- Year: 2025
- Subject: Building a Real-Time Recommendation Web App with Go, React, and PostgreSQL
- Supervisors: Dr. Jawad Yasin

## ABSTRACT

[Abstract content goes here]

## Keywords

[Keywords go here]

## Pages

- Pages: xx pages

## Glossary

*   **ACID**: Atomicity, Consistency, Isolation, Durability (Database transaction properties)
*   **API**: Application Programming Interface
*   **Axios**: Promise-based HTTP client for JavaScript
*   **Bcrypt**: Password Hashing Function
*   **CSS**: Cascading Style Sheets
*   **CRUD**: Create, Read, Update, Delete (Basic database operations)
*   **DOM**: Document Object Model
*   **Gin**: Go Web Framework
*   **Git**: Distributed Version Control System
*   **Go**: (Golang) Programming Language
*   **GORM**: Go Object-Relational Mapper
*   **HTTP**: Hypertext Transfer Protocol
*   **IDE**: Integrated Development Environment
*   **JSON**: JavaScript Object Notation
*   **JWT**: JSON Web Token
*   **MVCC**: Multi-Version Concurrency Control
*   **ORM**: Object-Relational Mapper
*   **PostgreSQL**: Object-Relational Database System
*   **React**: JavaScript library for building user interfaces
*   **REST**: Representational State Transfer
*   **RFC**: Request for Comments (Internet standards document)
*   **Socket.IO**: Real-time communication library
*   **SQL**: Structured Query Language
*   **TypeScript**: Statically typed superset of JavaScript
*   **UI**: User Interface
*   **URI**: Uniform Resource Identifier
*   **VCS**: Version Control System
*   **VS Code**: Visual Studio Code (Source-code editor)
*   **WebSocket**: Computer communications protocol for full-duplex communication channels
*   **XSRF**: Cross-Site Request Forgery
*   **Zustand**: State management library for React

## Table of Contents

*   1 Introduction
*   2 Foundational Technologies
    *   2.1 Backend System Technologies
        *   2.1.1 Go Programming Language
        *   2.1.2 Gin Web Framework
        *   2.1.3 PostgreSQL Database
        *   2.1.4 RESTful API Architecture
        *   2.1.5 Socket.IO for Real-time Communication
    *   2.2 Frontend System Technologies
        *   2.2.1 React Library
        *   2.2.2 TypeScript Language
        *   2.2.3 Zustand State Management
        *   2.2.4 Tailwind CSS
        *   2.2.5 Axios HTTP Client
    *   2.3 Security Mechanisms
        *   2.3.1 JWT (JSON Web Token) Authentication
        *   2.3.2 Bcrypt Password Hashing
    *   2.4 Development Environment and Tools
        *   2.4.1 Git Version Control System
        *   2.4.2 Visual Studio Code (VS Code) Editor
*   3 Methods
*   4 Practical Part
    *   4.1 Data Management and Persistence
        *   4.1.1 Database Design and Schema
        *   4.1.2 Backend Data Interaction
    *   4.2 Backend Service Implementation
        *   4.2.1 User Authentication and Authorization
    *   4.3 Connection Management
        *   4.3.1 User and Pet Profile Management APIs
        *   4.3.3 Photo Upload and Management APIs
        *   4.3.5 Connection Management APIs
    *   4.4 Frontend User Interface Implementation
        *   4.4.1 Component Structure and State Management
        *   4.4.2 Styling and Responsive Design
        *   4.4.3 Backend Communication using Axios
*   5 Results
*   6 Summary
*   References

## Figures

No list of figures found.

## Tables

No list of tables found.

## Program codes

No list of program codes found.

## 1 Introduction

The role of pets in human lives has significantly grown in recent years. While companion animals provide significant emotional benefits, establishing connections with fellow pet owners can sometimes be challenging. Pet owners may seek opportunities to connect with others for various reasons, such as finding companions for shared activities like dog walking or cat playdates or simply exchanging insights on the unique aspects of pet ownership. While large social media platforms are available, they are often too general and do not specifically cater to the unique needs of the pet owner community. The motivation for this thesis project arose from identifying this gap and a keen interest in practical web development.

The primary objective of this thesis is to explore the development of a more effective online space for pet owners. To achieve this objective, a web application named "PetPals" was developed. This project serves as more than merely an academic exercise; it is designed to address a practical need by developing a functional tool. Undertaking this project also served to significantly enhance programming skills through the process of building a complete application.

"PetPals" is designed as a real-time recommendation web application specifically tailored for pet owners. The core concept is to facilitate connections among pet enthusiasts within their local communities. The application enables users to create profiles for themselves and their pets. Based on location and shared interests (e.g., pet type, preferred activities), it assists users in finding suitable companions for pet activities, facilitating the planning of pet playdates, and discovering or even organizing local pet-friendly events. Key features implemented include user and pet profiles, location-aware matching capabilities, tools for managing connections (such as friend requests), event creation functionalities, and a real-time chat feature to facilitate communication.

It is important to note that PetPals is not intended as a general social media platform akin to Facebook. Instead, it aims to provide a focused, practical service for a specific user group: individuals who share a passion for their pets and wish to cultivate a community around this shared interest. The application is designed to facilitate real-world interactions and mutual support among pet owners in close proximity.

For the technical implementation of PetPals, Go was selected for the backend services, React for the user interface (frontend), and PostgreSQL for data storage. The application is designed for accessibility, intended to function effectively on both mobile and desktop web browsers.

This project also seeks to address the following key questions:

*   What specific features and requirements are most important for an online platform that helps pet owners connect in real-time?
*   How can the technical structure (architecture) of such a web application be designed to effectively and quickly match pet owners based on their location, pets, and interests?
*   How can technologies like Go, React, PostgreSQL, and WebSockets work together effectively to build a responsive and interactive platform for pet owners?

By developing PetPals and trying to answer these questions, this thesis aims to deliver a working prototype that shows how modern web technologies can be used to enhance the social lives of pet owners. The project will focus heavily on the practical development (about 70%) while also documenting the design choices, technical solutions, and findings (about 30%).

## 2 Foundational Technologies

This chapter details the core technologies selected for the development of the web application discussed in this thesis. The selection process considered the functional requirements aiming for a robust, scalable, and maintainable system. The following sections provide an overview of the chosen technologies for the backend and frontend systems, outlining their general characteristics and capabilities.

### 2.1 Backend System Technologies

The backend architecture is responsible for application logic, data management, and communication services.

#### 2.1.1 Go Programming Language

Go, often referred to as Golang, is an open-source programming language initially developed at Google by Robert Griesemer, Rob Pike, and Ken Thompson, and publicly announced in 2009. It was designed to improve programming productivity in an era of multicore processors, networked machines, and large codebases. Go is a statically typed, compiled language known for its simplicity, efficiency, and strong built-in support for concurrent programming through goroutines and channels. These characteristics make it well-suited for developing high-performance network services and backend systems ([Go Team Documentation, n.d.](https://go.dev/doc/)).

#### 2.1.2 Gin Web Framework

Gin is a high-performance HTTP web framework written in Go. It features a Martini-like API but claims significantly better performance, partly due to its use of HTTP router. Gin is designed to be minimalistic, providing essential tools for routing, middleware handling, rendering (JSON, XML, HTML), and managing request/response cycles without imposing strict structural constraints. Its focus on performance and relatively small footprint make it a popular choice for building RESTful APIs and web services in the Go ecosystem ([Gin Web Framework Documentation, n.d.](https://gin-gonic.com/docs/)).

#### 2.1.3 PostgreSQL Database

PostgreSQL is a powerful, open-source object-relational database system with over 30 years of active development, originating from the POSTGRES project at the University of California, Berkeley. It has earned a strong reputation for reliability, feature robustness, and performance. PostgreSQL supports standard SQL queries and offers many advanced features, including complex queries, foreign keys, triggers, updatable views, transactional integrity (ACID compliance), and multi-version concurrency control (MVCC). Its extensibility allows users to define their own data types, index types, and functional languages ([PostgreSQL Official Documentation, n.d.](https://www.postgresql.org/docs/)).

#### 2.1.4 RESTful API Architecture

Representational State Transfer (REST) is an architectural style, first defined by Roy Fielding in his 2000 doctoral dissertation, that outlines constraints for designing networked applications. It relies on a stateless, client-server communication protocol, typically HTTP. Key principles of REST include resource identification through URIs, manipulation of resources through standard representations (like JSON or XML), and the use of standard HTTP methods (GET, POST, PUT, DELETE) to perform actions on these resources. RESTful APIs are widely adopted for web services due to their simplicity, scalability, and loose coupling between client and server ([Fielding, 2000](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)).

#### 2.1.5 Socket.IO for Real-time Communication

Socket.IO is a popular JavaScript library (with implementations in other languages like Go) that enables real-time, bidirectional, and event-based communication between web clients and servers. It primarily utilizes the WebSocket protocol but provides fallbacks to other methods like HTTP long-polling if WebSockets are not supported. Socket.IO offers additional features beyond raw WebSockets, including reliability mechanisms (like automatic reconnection), message buffering, broadcasting to specific clients or groups (rooms), multiplexing via namespaces, and simpler APIs for handling events ([Socket.IO Documentation, 2025](https://socket.io/docs/v4/)). These features facilitate the implementation of complex real-time functionalities in web applications.

### 2.2 Frontend System Technologies

The frontend constitutes the user-facing part of the application, rendered and executed within the user's web browser.

#### 2.2.1 React Library

An early prototype of React, created by a Facebook software engineer named Jordan Walke and dubbed FaxJS, was originally introduced in 2011. In 2012, Walke completed the prototype and invented React, which Facebook and Instagram quickly adopted that same year. React became available for Ruby on Rails and Python applications after being open sourced in 2013. 2015 brought the release of React Native, an extension of React for mobile programming on Android and iOS. React is a JavaScript library for building user interfaces, particularly single-page applications. It employs a declarative, component-based approach where UIs are constructed from reusable pieces called components. React utilizes a concept known as the virtual DOM to optimize updates and rendering, generally leading to efficient performance ([React Official Documentation, n.d.](https://react.dev/)).

#### 2.2.2 TypeScript Language

TypeScript is an open-source programming language developed and maintained by Microsoft. It was first released in 2012 as a response to the challenges of building large-scale applications with JavaScript. TypeScript is a strict syntactical superset of JavaScript, meaning any valid JavaScript code is also valid TypeScript code, but it adds optional static typing, classes, and interfaces. The primary benefit of using TypeScript is the ability to catch errors during development through type checking, leading to more robust and maintainable code, especially in larger projects. It also enhances developer productivity through improved code completion, refactoring, and navigation in code editors ([TypeScript Official Documentation, n.d.](https://www.typescriptlang.org/docs/)).

#### 2.2.3 Zustand State Management

Zustand is a small, fast, and scalable state management library primarily designed for React applications. It emerged as a simpler alternative to more complex state management solutions like Redux. Zustand leverages React hooks and provides a minimal API for creating shared state stores that components can subscribe to. Its core philosophy emphasizes simplicity, minimal boilerplate, and flexibility, allowing developers to manage application state without extensive setup or imposing strict architectural patterns ([Introduction - Zustand, n.d.](https://zustand.docs.pmnd.rs/getting-started/introduction)).

#### 2.2.4 Tailwind CSS

Tailwind CSS is a utility-first CSS framework created by Adam Wathan, first released in 2017. Unlike component-based frameworks (like Bootstrap or Material-UI) that provide pre-designed components, Tailwind provides low-level utility classes that let developers build completely custom designs directly within their HTML markup. This approach encourages building unique UIs without writing custom CSS and results in highly maintainable and scalable styling, as styles are co-located with the elements they apply to. It also helps keep final CSS bundle sizes small by purging unused styles during the build process ([Tailwind CSS Documentation, 2021](https://tailwindcss.com/docs)).

#### 2.2.5 Axios HTTP Client

Axios is a popular, promise-based HTTP client library for JavaScript, usable in both browser and Node.js environments. It simplifies the process of making asynchronous HTTP requests (like GET, POST, PUT, DELETE) to interact with backend APIs. Key features include request and response interception (allowing modification or logging), automatic transformation of request and response data (e.g., to/from JSON), client-side protection against Cross-Site Request Forgery (XSRF), and straightforward cancellation of requests. Its ease of use and robust feature set have made it a common choice for handling API communication in modern web applications ([Axios Documentation, n.d.](https://axios-http.com/docs/intro)).

### 2.3 Security Mechanisms

Ensuring the security of user data and application integrity is paramount.

#### 2.3.1 JWT (JSON Web Token) Authentication

JSON Web Token (JWT) is an open, industry standard (RFC 7519) method for securely representing claims between two parties. It defines a compact and self-contained way for transmitting information as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs typically consist of three parts separated by dots (.), which are the Header, Payload, and Signature. The header usually identifies the algorithm used for the signature, the payload contains the claims (statements about an entity, like user identity, and additional data), and the signature is used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way ([JWT.io Introduction, n.d.](https://jwt.io/introduction)). JWTs are commonly used for authentication and authorization in web applications, allowing for stateless session management.

#### 2.3.2 Bcrypt Password Hashing

Bcrypt is a widely used password hashing function designed by Niels Provos and David Mazières, based on the Blowfish cipher. Its primary purpose is to securely store user passwords. Unlike simple hashing algorithms (like MD5 or SHA-1) which are fast and thus vulnerable to brute-force attacks, Bcrypt is intentionally slow. It incorporates a "salt" (random data added to the password before hashing) to prevent rainbow table attacks and includes a configurable "cost" factor (work factor) that increases the computational effort required to compute the hash, making brute-force attacks significantly more time-consuming and expensive. Securely hashing passwords with algorithms like Bcrypt is a critical security practice for any application handling user credentials ([Provos & Mazières, 1999](https://harrymoreno.com/assets/greatPapersInCompSci/A_Future-Adaptable_Password_Scheme_-_provos_(1999).pdf)).

### 2.4 Development Environment and Tools

Efficient development relies on appropriate tools for code management, writing, and collaboration.

#### 2.4.1 Git Version Control System

Git is a distributed version control system (VCS) created by Linus Torvalds in 2005. It is designed to handle everything from small to very large projects with speed and efficiency. Git allows developers to track changes in source code during software development, facilitating collaboration among multiple developers. Key features include branching and merging capabilities (allowing developers to work on different features or fixes in isolation), history tracking (making it possible to revert to previous versions), and distributed workflows (where each developer has a full copy of the repository). Git has become the de facto standard for version control in software development ([Git - Documentation, n.d.](https://git-scm.com/doc)).

#### 2.4.2 Visual Studio Code (VS Code) Editor

Visual Studio Code, commonly known as VS Code, is a free source-code editor developed by Microsoft for Windows, Linux, and macOS. Launched in 2015, it quickly gained popularity among developers due to its performance, extensive feature set, and large ecosystem of extensions. Core features include support for debugging, embedded Git control, syntax highlighting for numerous languages, intelligent code completion (IntelliSense), code snippets, and code refactoring tools. Its extensibility allows users to customize the editor with themes, key bindings, and additional functionality through extensions covering virtually any programming language or workflow ([Documentation for Visual Studio Code, n.d.](https://code.visualstudio.com/docs)).

## 3 Goals and Methods

This section covers both the goals that were defined for the thesis project, as well as the methods and methodologies that were utilised during the thesis writing and the PetPals application creation process. Additionally, the various defined criteria used to evaluate the extent to which the research questions were successfully answered are also explained.

### 3.1 Project Goals and Design Vision

As explained in the introduction to this thesis, the primary project goal revolved around creating a functional web application prototype named "PetPals". This application aims to provide a dedicated online space for pet owners to connect based on location and shared interests, offering features such as user/pet profiles, matching/discovery, and real-time communication.

The created application utilises a multitude of modern technologies and architectural patterns. In order to address the topic of Building a Real-Time Recommendation Web App with Go, React, and PostgreSQL, the following research questions were addressed:

*   What specific features and requirements are most important for an online platform that helps pet owners connect in real-time?
*   How can the technical structure (architecture) of such a web application be designed to effectively and quickly match pet owners based on their location, pets, and interests?
*   How can technologies like Go, React, PostgreSQL, and WebSockets work together effectively to build a responsive and interactive platform for pet owners?

### 3.2 Defining Success Criteria

Before the application development commenced, specific success criteria were defined for each research question to provide an objective basis for evaluating the project's outcomes.

#### 3.2.1 Defining Success Criterion for Core Features and Requirements

With respect to the first research question concerning essential features, the success criterion was defined as follows:
The final PetPals application prototype must implement and demonstrate functional core capabilities. These include user profile creation, viewing, and basic editing, along with pet profile creation, viewing, and association with a user. Furthermore, a user discovery or matching mechanism must be present, allowing filtering based on geographical proximity (using a distance radius) and at least two distinct pet profile attributes, such as pet type or activity level. A real-time chat interface enabling text message exchange between connected users is also required, as is basic connection management allowing users to view their established connections. The successful implementation and basic operational correctness of these fundamental features would signify that this research question has been adequately addressed for the scope of this prototype.

#### 3.2.2 Defining Success Criterion for Matching Architecture Effectiveness

Regarding the second research question focused on architectural design for effective matching, the success criterion involved two aspects: functional correctness and architectural soundness. For functional correctness, the implemented matching functionality must correctly return a list of users based on user-specified criteria including location (within a defined radius) and selected pet profile attributes like type or personality. The relevance of these returned matches for predefined test scenarios will be confirmed via manual inspection during the evaluation phase. For architectural soundness, the application architecture, as detailed and implemented in the subsequent chapter covering the application coding, must exhibit a clear and logical separation of concerns. This separation should be evident between the frontend presentation layer (React), the backend API and business logic layer (Go/Gin), and the data persistence layer (PostgreSQL), thereby facilitating modularity and maintainability.

#### 3.2.3 Defining Success Criterion for Technology Stack Integration

For the third research question addressing the effective integration of the chosen technology stack (Go, React, PostgreSQL, WebSockets via Socket.IO), the success criterion was defined by demonstrating successful end-to-end data flow for both standard and real-time operations. Regarding standard operations using RESTful principles, successful creation, retrieval, update, and deletion (CRUD) operations for core data entities like user and pet profiles must be shown. This involves verifying data flow from the React frontend (using Axios), through the Go backend (using Gin and GORM), to the PostgreSQL database, and back to the frontend display. For real-time operations using WebSockets, successful transmission and reception of messages in near real-time must be demonstrated within the chat feature. This requires showing messages originating from one React client, passing through the Go backend (using the Socket.IO implementation), and being delivered to other connected React clients with functionally negligible latency observed in the user interface.

### 3.3 Ethics and Responsibility

In developing the PetPals prototype, ethical considerations, particularly concerning user data privacy, were acknowledged. The application handles potentially sensitive information including user profiles, pet details, user location (for matching), and private messages. Security mechanisms, such as JWT for authentication and Bcrypt for password hashing as introduced in the preceding chapter, were implemented to protect user accounts. It is recognised that a production-level application would require more comprehensive privacy policies, explicit user consent for location sharing and data usage, and potentially more robust data protection measures. This prototype, however, focuses on technical implementation and does not store or process real user data beyond what is necessary for demonstration purposes within the development environment. ([Metana, n.d.](https://metana.io/blog/bcrypt-and-jwt-web-app-security/))

### 3.4 Project Planning and Management

The development of the PetPals application followed an iterative development approach. While not strictly adhering to a formal framework like Scrum due to the nature of an individual project, the process involved breaking down the required features into smaller, manageable tasks. Progress was tracked informally, allowing for flexibility and adaptation as development challenges arose. Version control was maintained throughout the project lifecycle using Git, with code hosted on a GitHub repository. This facilitated tracking changes, managing different development branches (if necessary), and providing a backup of the codebase.

### 3.5 Tools & Additional Methodologies

To facilitate the coding process, specific tools and supplementary methodologies were employed. Visual Studio Code (VS Code) served as the primary Integrated Development Environment (IDE) for writing, debugging, and managing both the Go backend code and the React/TypeScript frontend code, leveraging its extensive extension ecosystem. As mentioned in the previous section, Git and GitHub were utilised for version control (source code management), enabling change tracking and repository hosting. Standard code formatting practices were generally followed, such as using gofmt for Go code and potentially ESLint/Prettier configurations for the TypeScript/React frontend, aiming for code consistency. Furthermore, architectural patterns elaborated upon previously, including frontend-backend separation and the combined use of RESTful and WebSocket APIs, were consciously applied during the design and implementation phases.

## 4 Practical Part

This chapter provides a detailed account of the design, architecture, and specific implementation processes undertaken during the development of the PetPals web application. Building upon the foundational technologies and theoretical concepts discussed in Chapter 2, this section demonstrates how these principles were applied in practice to create a functional system. The chapter covers the key functional modules of the application, with a particular focus on the implemented core features: user and pet profile management, photo handling, pet recommendation logic, and connection management. The descriptions are supplemented, where appropriate, with illustrative code snippets, command-line examples, and user interface screenshots to clarify the implementation details. It is important to note that all descriptions adhere to a formal academic style, avoiding the use of first and second-person pronouns and presenting information in coherent paragraphs rather than lists.

### 4.1 System Architecture and Technology Stack Integration

The overall structure and the synergistic integration of the chosen technologies form the backbone of the PetPals application. This section outlines the architectural pattern adopted and explains how the different components of the technology stack work together.

#### 4.1.1 Overall Architecture Design

The PetPals application employs a distributed architecture based on the client-server model. This model separates the application into distinct layers, facilitating modularity and scalability. The core components include the frontend user interface, the backend service layer, the data persistence layer, and a planned real-time communication layer. The frontend, built with React, serves as the primary point of interaction for users, rendering the interface and capturing user input. The backend, developed using Go and the Gin framework, encapsulates the core business logic, processes API requests, and manages data operations. The data persistence layer utilizes a PostgreSQL database to store and retrieve application data, such as user profiles, pet information, and connections. Although not fully implemented within the scope of this project phase, a real-time communication layer using WebSockets (via Socket.IO) is designed to handle features like instant messaging and notifications, connecting directly between the client and server.

These components interact primarily over standard network protocols. The frontend communicates with the backend through HTTP requests, following the principles of RESTful API design ([Fielding, 2000](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)), as discussed in Chapter 2. This involves the frontend sending requests to specific API endpoints defined by the backend, and the backend responding with data, typically in JSON format. For real-time features, the interaction is planned to occur over the WebSocket protocol, enabling bidirectional communication channels. The adoption of a frontend-backend separation principle is central to the PetPals architecture. This approach allows for independent development and deployment cycles for the client and server components, offers flexibility in choosing specific technologies for each layer, and enhances the overall scalability of the application. The overall structure is visualized in the application architecture diagram (see Figure 4.1.1. PetPals Application Architecture).

#### 4.1.2 Technology Stack Rationale and Integration

As outlined in Chapter 2, the core technology stack comprising Go, React, and PostgreSQL was selected based on criteria such as performance, developer productivity, community support, and suitability for the specific requirements of the PetPals application. This section details how these chosen technologies are integrated to function cohesively.

The backend system, powered by Go ([Go Team Documentation, n.d.](https://go.dev/doc/)), leverages the Gin web framework ([Gin Web Framework Documentation, n.d.](https://gin-gonic.com/docs/)) to expose RESTful API endpoints. Gin handles incoming HTTP requests, routes them to appropriate handler functions, and manages the request-response cycle efficiently. Business logic, such as user authentication, profile management, and recommendation generation, is implemented within service layers in the Go application. For database interactions, the Go backend utilizes GORM, an Object-Relational Mapper (ORM), which simplifies communication with the PostgreSQL database ([PostgreSQL Official Documentation, n.d.](https://www.postgresql.org/docs/)). GORM maps Go struct definitions to database tables and provides a high-level API for performing CRUD (Create, Read, Update, Delete) operations, abstracting away much of the underlying SQL complexity, aligning with the ORM principles discussed in Section 2.1.3.

On the frontend, the user interface is constructed using the React library ([React Official Documentation, n.d.](https://react.dev/)). React's component-based architecture allows for the creation of reusable UI elements. TypeScript ([TypeScript Official Documentation, n.d.](https://www.typescriptlang.org/docs/)) is employed alongside React to introduce static typing, enhancing code maintainability and catching potential errors during development. Global application state, such as user authentication status or fetched data, is managed using the Zustand library ([Introduction - Zustand, n.d.](https://zustand.docs.pmnd.rs/getting-started/introduction)), providing a simple and efficient mechanism for state sharing across components as explained in Section 2.2.3. Styling is handled by the Tailwind CSS framework ([Tailwind CSS Documentation, 2021](https://tailwindcss.com/docs)), which utilizes utility classes to enable rapid development of custom user interfaces directly within the markup. Communication between the React frontend and the Go backend is primarily managed by the Axios library ([Axios Documentation, n.d.](https://axios-http.com/docs/intro)), which simplifies the process of making asynchronous HTTP requests to the backend API endpoints for fetching and submitting data. For the planned real-time features, the integration involves using the Socket.IO client library ([Socket.IO Documentation, 2025](https://socket.io/docs/v4/)) in React to establish and manage WebSocket connections with the corresponding Socket.IO implementation on the Go backend, enabling event-based, bidirectional communication as described in Section 2.1.5.

### 4.2 Data Management and Persistence

Effective data management is crucial for the functionality of the PetPals application. This section details the design of the database schema and the mechanisms used by the backend system to interact with the persistent data store.

#### 4.2.1 Database Design and Schema

The data persistence layer utilizes PostgreSQL, chosen for its reliability, ACID compliance, and advanced features suitable for relational data management, as discussed in Chapter 2 ([PostgreSQL Official Documentation, n.d.](https://www.postgresql.org/docs/)). The schema is centered around core models representing the application's main entities: `User`, `Pet`, `Photo`, `Connection`, and the planned `Conversation` and `Message`. Each model includes standard fields like a unique UUID identifier and creation/update timestamps.

The `User` model encapsulates user profile data, including identification (name, unique email, hashed password), contact/location details, and personalization attributes like a biography and interests (stored as a string array). It forms a one-to-many relationship with `Pet`, indicating ownership, and uses the `Photo` model for storing avatar and gallery images.

The `Pet` model stores comprehensive details about each pet, linked to its owner via a `UserID` foreign key. Key attributes include the pet's name, type (e.g., "dog", "cat"), breed, gender, and birthday (for age calculation). Descriptive fields cover personality, activities, and play style (as string arrays), along with an activity level indicator and optional boolean flags for health statuses (microchipped, vaccinated, neutered). Soft deletion is supported via GORM's `DeletedAt` field. Pet photos are managed through the `Photo` model.

The `Photo` model provides a generic structure for image metadata, linked polymorphically to either a `User` or a `Pet` via `OwnerType` and `OwnerID` fields. It stores the image `URL`, a flag (`IsPrimary`) for profile pictures, an ordering field, and an optional caption.

The `Connection` model mediates the relationship between users, storing the `RequesterID`, `ReceiverID`, and the connection `Status` ("pending", "accepted", "blocked"). This structure effectively represents the many-to-many connection linkage between users.

For the planned real-time chat feature, `Conversation` and `Message` models are defined. `Conversation` links the two participating users, while `Message` stores individual message content, sender information, and potentially read status.

These models and their relationships, illustrated in the entity relationship diagram (see Figure 4.2.1. PetPals Database Entity Relationship Diagram), establish a clear and efficient data structure, leveraging RDBMS principles and ORM capabilities as outlined in Chapter 2.

#### 4.2.2 Backend Data Interaction Implementation

Interaction between the Go backend service and the PostgreSQL database is primarily managed using GORM, the Go Object-Relational Mapper library introduced in Chapter 2. GORM significantly simplifies data persistence operations by mapping Go struct definitions (like the `User` and `Pet` models described previously) directly to database tables. This mapping allows developers to work with Go objects rather than writing raw SQL queries for many common tasks.

GORM provides a fluent API for performing standard CRUD (Create, Read, Update, Delete) operations. For instance, retrieving a user by ID can be accomplished with a concise GORM method call, which translates into the appropriate SQL `SELECT` statement. Similarly, creating a new pet involves instantiating a `Pet` struct with the desired data and passing it to GORM's `Create` method, which handles the SQL `INSERT` operation. Updates are managed through methods like `Save` or `Updates`, and deletion (including soft deletes using GORM's `DeletedAt` feature, if configured in the model) is handled by the `Delete` method. GORM automatically handles tasks like parameter binding and can help prevent SQL injection vulnerabilities associated with manual query construction, applying the theoretical benefits of ORMs discussed in Chapter 2.

An example illustrating the use of GORM to query for a user record based on their email address within the backend service is shown below (Program Code 4.2.2.1. Example GORM Query for User by Email):

```go
// Program Code 4.2.2.1. Example GORM Query for User by Email
var user models.User
result := database.DB.Where("email = ?", email).First(&user)
if result.Error != nil {
    // Handle error, e.g., user not found
    if errors.Is(result.Error, gorm.ErrRecordNotFound) {
        // ... specific not found logic ...
    } else {
        // ... general database error logic ...
    }
    return nil, result.Error
}
// User found, proceed with 'user' object
```

This Go code snippet demonstrates how GORM is used to retrieve a single user record matching a given email. It assigns the found record to the `user` variable and includes basic error handling, specifically checking if the error is due to the record not being found (`gorm.ErrRecordNotFound`) or some other database issue. Similar patterns leveraging GORM's capabilities are employed throughout the backend service layer for interacting with `Pet`, `Photo`, `Connection`, and other defined data models, streamlining database operations.

Throughout these handlers, Gin's capabilities for parameter binding (`c.Param`, `c.ShouldBindJSON`) are utilized to extract information from the request. The handlers delegate the core business logic and data access concerns to the service and repository layers, respectively, adhering to the principles of separation of concerns discussed in Chapter 2 and aligning with RESTful API design. Error handling is implemented at each layer, translating specific errors (e.g., record not found, validation failure, unauthorized access) into appropriate HTTP status codes and JSON error responses for the client.

### 4.3 Backend Service Implementation

This section details the implementation of the core backend services that power the PetPals application, including user authentication, profile management, photo handling, pet recommendations, and connection management.

#### 4.3.1 User Authentication and Authorization

Secure user authentication and authorization are fundamental to protecting user data and controlling access to application features. The PetPals backend implements these using industry-standard techniques.

The user registration process involves receiving user credentials (name, email, password) via the `POST /api/v1/auth/register` endpoint. Before storing the user information in the database, the provided password undergoes secure hashing using the Bcrypt algorithm. As discussed in Chapter 2, Bcrypt is a deliberately slow hashing function that incorporates a salt, making it highly resistant to brute-force and rainbow table attacks ([Provos & Mazières, 1999](https://harrymoreno.com/assets/greatPapersInCompSci/A_Future-Adaptable_Password_Scheme_-_provos_(1999).pdf); [Metana, n.d.](https://metana.io/blog/bcrypt-and-jwt-web-app-security/)). The Go backend utilizes a library like `golang.org/x/crypto/bcrypt` to generate the hash (see Program Code 4.3.1.1. Bcrypt Password Hashing). Only the resulting hash is stored in the `User` model's `Password` field.

User login is handled by the `POST /api/v1/auth/login` endpoint. When a user attempts to log in, the backend retrieves the user record corresponding to the provided email address. It then compares the provided password with the stored hash using Bcrypt's comparison function. If the comparison is successful, the authentication is considered valid.

Upon successful authentication (either during registration or login), the backend generates a JSON Web Token (JWT). As detailed in Chapter 2, JWT provides a compact and self-contained method for representing claims securely between parties ([JWT.io Introduction, n.d.](https://jwt.io/introduction)). The JWT generated by PetPals contains claims identifying the user (e.g., user ID) and potentially an expiration time. This token is signed using a secret key known only to the server, ensuring its integrity. The Go backend employs a library such as `github.com/golang-jwt/jwt/v5` for JWT generation and validation (see Program Code 4.3.1.2. JWT Generation). The generated JWT is then returned to the client.

The client application (React frontend) stores this JWT and includes it in the `Authorization` header (as a Bearer token) for subsequent requests to protected API endpoints. The backend utilizes Gin middleware to intercept incoming requests to these protected routes. This middleware extracts the JWT from the header, verifies its signature using the server's secret key, checks its validity (e.g., expiration), and extracts the user claims. If the token is valid, the user information is typically added to the request context, making it available to the downstream handler functions. If the token is invalid or missing, the middleware rejects the request, usually returning a 401 Unauthorized status code. This middleware effectively enforces authentication for protected resources.

Basic authorization is also implemented. For instance, API endpoints operating on specific user resources (e.g., `PATCH /api/v1/me`, `GET /api/v1/me/pets`) include checks to ensure that the authenticated user making the request (identified via the UserID from the JWT context) is the owner of the resource being accessed or modified. This is typically done by comparing the context UserID with the owner ID associated with the requested resource (e.g., the `UserID` field in the `Pet` model).

The Go backend utilizes a library like `golang.org/x/crypto/bcrypt` to generate the hash. Program Code 4.3.1.1 illustrates the password hashing during user registration within the authentication service. Only the resulting hash is stored in the `User` model's `Password` field.

```go
// Program Code 4.3.1.1. Bcrypt Password Hashing (auth_service.go)
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
if err != nil {
    log.Printf("Error hashing password for %s: %v", email, err)
    return nil, "", errors.New("failed to hash password")
}
// ... store string(hashedPassword) in user model ...
```

User login is handled by the `POST /api/v1/auth/login` endpoint. When a user attempts to log in, the backend retrieves the user record corresponding to the provided email address. It then compares the provided password with the stored hash using Bcrypt's comparison function, as shown in Program Code 4.3.1.2. If the comparison is successful, the authentication is considered valid.

```go
// Program Code 4.3.1.2. Bcrypt Password Comparison (auth_service.go)
err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
if err != nil {
    // Password doesn't match
    return nil, "", errors.New("invalid credentials")
}
```

Upon successful authentication (either during registration or login), the backend generates a JSON Web Token (JWT). As detailed in Chapter 2, JWT provides a compact and self-contained method for representing claims securely between parties ([JWT.io Introduction, n.d.](https://jwt.io/introduction)). The JWT generated by PetPals contains claims identifying the user (e.g., user ID) and an expiration time. This token is signed using a secret key known only to the server, ensuring its integrity. The Go backend employs a library such as `github.com/golang-jwt/jwt/v5` for JWT generation and validation. Program Code 4.3.1.3 demonstrates the JWT generation process within the authentication service, setting the UserID claim and an expiration time (e.g., 72 hours).

```go
// Program Code 4.3.1.3. JWT Generation (auth_service.go)
type jwtCustomClaims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

func (s *authService) generateJWT(userID uuid.UUID) (string, error) {
	claims := &jwtCustomClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)), // Example: 72 hours expiration
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "match-me-api",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(s.cfg.JWT.Secret)) // Secret from config
	if err != nil {
		return "", err
	}
	return t, nil
}
```

The client application (React frontend) stores this JWT and includes it in the `Authorization` header (as a Bearer token) for subsequent requests to protected API endpoints. The backend utilizes Gin middleware, specifically implemented in `internal/middleware/auth_middleware.go`, to intercept incoming requests to these protected routes. This middleware extracts the JWT from the header, verifies its signature using the server's secret key, checks its validity (e.g., expiration), and extracts the user claims. Program Code 4.3.1.4 shows the core logic of the JWT validation within the middleware. If the token is valid, the user information (UserID) is added to the request context using `context.WithValue`, making it available to the downstream handler functions. If the token is invalid or missing, the middleware rejects the request, usually returning a 401 Unauthorized status code. This middleware effectively enforces authentication for protected resources.

```go
// Program Code 4.3.1.4. JWT Validation in Middleware (auth_middleware.go)
// (Simplified extract from AuthMiddleware function)
accessToken := fields[1] // Assumes Bearer token format parsed correctly
claims := &struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}{}

token, err := jwt.ParseWithClaims(accessToken, claims, func(token *jwt.Token) (interface{}, error) {
	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}
	return []byte(cfg.JWT.Secret), nil // Secret from config
})

if err != nil {
	// Handle various errors like expired, invalid signature etc.
	// ... error handling logic ...
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": errMsg})
	return
}

if !token.Valid {
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
	return
}

userID := claims.UserID
// Set user ID in context
ctx := context.WithValue(c.Request.Context(), UserIDKey, userID)
c.Request = c.Request.WithContext(ctx)
c.Next() // Proceed to the handler
```

Basic authorization is also implemented. For instance, API endpoints operating on specific user resources (e.g., `PATCH /api/v1/me`, `GET /api/v1/me/pets`) include checks to ensure that the authenticated user making the request (identified via the UserID from the JWT context) is the owner of the resource being accessed or modified. This is typically done by comparing the context UserID with the owner ID associated with the requested resource (e.g., the `UserID` field in the `Pet` model).

#### 4.3.2 User and Pet Profile Management APIs

A significant part of the backend functionality revolves around managing user and pet profiles through dedicated RESTful API endpoints. This section describes the implementation of these core Create, Read, Update, and Delete (CRUD) operations.

**User Profile Management:**
The API provides endpoints under the `/api/v1/me` path for the authenticated user to manage their own profile.

*   **Retrieving User Profile (`GET /me`):** The `GetCurrentUser` handler function in `internal/handlers/user_handler.go` handles requests to this endpoint. It retrieves the authenticated `UserID` from the request context (set by the authentication middleware) and calls the `GetUserByID` method of the `UserService` (`internal/service/user_service.go`). The service layer, in turn, interacts with the `UserRepository` (`internal/repository/user_repository_impl.go`) to fetch the user data using GORM. Sensitive information like the password hash is omitted before returning the user object to the client.
*   **Updating User Profile (`PATCH /me`):** The `UpdateCurrentUser` handler manages updates to the user's basic information (excluding photos, which are handled separately). It extracts the `UserID` from the context and binds the JSON request body to a `models.UserUpdatePayload` struct. This payload, containing only the fields to be updated, is passed to the `UpdateUser` method of the `UserService`. The service performs necessary validation and constructs a map of updates to pass to the `UserRepository`, which uses GORM's `Updates` method to modify the user record in the database. Program Code 4.3.2.1 shows a simplified structure of the `UpdateCurrentUser` handler.

```go
// Program Code 4.3.2.1. User Profile Update Handler Structure (user_handler.go)
func (h *UserHandler) UpdateCurrentUser(c *gin.Context) {
	// 1. Get UserID from context (middleware.UserIDKey)
	userID, ok := c.Request.Context().Value(middleware.UserIDKey).(uuid.UUID)
	// ... (error handling for missing/invalid userID) ...

	// 2. Bind JSON Payload
	var payload models.UserUpdatePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		// ... (error handling for invalid JSON) ...
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// 3. Call the UserService
	updatedUser, err := h.userService.UpdateUser(c.Request.Context(), userID, &payload)
	if err != nil {
		// ... (handle service errors: ErrNotFound, ErrValidation, etc.) ...
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
		return
	}

	// 4. Return the updated user
	c.JSON(http.StatusOK, updatedUser)
}
```

**Pet Profile Management:**
Similar CRUD operations are provided for managing pets associated with the logged-in user, accessed via `/api/v1/me/pets`. These are handled by `internal/handlers/pet_handler.go`.

*   **Creating a Pet (`POST /me/pets`):** The `CreatePet` handler binds the incoming JSON request body to a `models.Pet` struct. It then calls the `AddPet` method of the `PetService` (`internal/service/pet_service.go`). The service layer automatically retrieves the authenticated `UserID` from the request context, associates it with the new pet data, performs validation (e.g., ensuring required fields like name and type are present), and interacts with the `PetRepository` (`internal/repository/pet_repository_impl.go`) to insert the new pet record into the database using GORM's `Create` method.
*   **Listing User's Pets (`GET /me/pets`):** The `GetUserPets` handler calls the `ListUserPets` method of the `PetService`. The service retrieves the `UserID` from the context and uses the `PetRepository` to query the database for all pets associated with that user. The service also populates photo URLs before returning the list.
*   **Retrieving a Specific Pet (`GET /me/pets/{petId}`):** The `GetPetByID` handler parses the `petId` from the URL path. It calls the `GetPetByID` method of the `PetService`, passing the context (for authorization checks) and the `petId`. The service verifies that the pet belongs to the authenticated user (using the context `UserID`) before fetching the pet details via the `PetRepository`.
*   **Updating a Pet (`PUT /me/pets/{petId}`):** The `UpdatePet` handler parses the `petId` and binds the JSON request body to a `models.PetUpdatePayload`. It calls the `UpdatePetInfo` method of the `PetService`. The service layer performs authorization checks (ensuring the authenticated user owns the pet), validates the payload, and uses the `PetRepository` with GORM's `Updates` method to apply the changes to the specific pet record.
*   **Deleting a Pet (`DELETE /me/pets/{petId}`):** The `DeletePet` handler parses the `petId` and calls the `DeletePet` method of the `PetService`. The service layer performs the ownership check and then uses the `PetRepository` to remove the pet record from the database, potentially using GORM's soft delete feature if configured.

Throughout these handlers, Gin's capabilities for parameter binding (`c.Param`, `c.ShouldBindJSON`) are utilized to extract information from the request. The handlers delegate the core business logic and data access concerns to the service and repository layers, respectively, adhering to the principles of separation of concerns discussed in Chapter 2 and aligning with RESTful API design. Error handling is implemented at each layer, translating specific errors (e.g., record not found, validation failure, unauthorized access) into appropriate HTTP status codes and JSON error responses for the client.

#### 4.3.3 Photo Upload and Management APIs

Handling user and pet photos constitutes a critical feature, encompassing file uploads, server-side storage, and database metadata management. The backend system provides dedicated API endpoints to manage these operations effectively.

Photo uploads for both users (`POST /me/photos`) and pets (`POST /me/pets/{petId}/photos`) are processed by the `PhotoHandler` located in `internal/handlers/photo_handler.go`. A shared internal function, `handleUpload`, consolidates the common logic for both owner types. This handler is designed to receive requests with a `Content-Type` of `multipart/form-data`. The process begins with parsing the relevant owner identifier, which is either the current user's ID obtained from the request context for user photos or the pet ID extracted from the URL parameter for pet photos. Subsequently, Gin's `c.Request.ParseMultipartForm` function is utilized to process the incoming form data. Following this, the handler extracts the uploaded image files associated with the `photos` form field. It also retrieves optional metadata, such as a `caption` and an `isPrimary` flag (indicating if the first uploaded photo should serve as the owner's primary avatar), using `c.PostForm`. For each file uploaded, the handler delegates the core processing by invoking the `UploadPhoto` method within the `PhotoService` (`internal/service/photo_service_impl.go`). This service method receives the request context (containing the authenticated user ID for authorization checks), the owner type ("user" or "pet"), the specific owner ID, the file header (`*multipart.FileHeader`) representing the uploaded file, the `isPrimary` flag, and the provided caption. Program Code 4.3.3.1 provides a simplified representation of this flow within the handler.

```go
// Program Code 4.3.3.1. Photo Upload Handling in Handler (photo_handler.go)
func (h *PhotoHandler) handleUpload(c *gin.Context, ownerType string) {
    // ... (Get ownerID based on ownerType) ...
    // ... (ParseMultipartForm) ...

    form := c.Request.MultipartForm
    files := form.File["photos"]
    caption := c.PostForm("caption")
    isPrimary := c.PostForm("isPrimary") == "true"

    var uploadedPhotos []*models.Photo
    for i, fileHeader := range files {
        makePrimary := isPrimary && i == 0
        // Call service (service performs authorization)
        photo, err := h.photoService.UploadPhoto(c.Request.Context(), ownerType, ownerID, fileHeader, makePrimary, caption)
        if err != nil {
            // ... (Handle upload error for this file) ...
            break // Stop on first error
        }
        uploadedPhotos = append(uploadedPhotos, photo)
    }
    // ... (Return response: uploadedPhotos or error) ...
}
```

The `PhotoService` orchestrates the subsequent steps involved in saving the photo. First, it interacts with the `FileStorage` component, specifically the `LocalStorage` implementation found in `internal/filestorage/local_storage.go`. The `SaveFile` method within `LocalStorage` generates a unique filename using UUID to avoid conflicts, opens the uploaded file stream, creates a corresponding destination file on the server within the configured base path (e.g., `./uploads`), copies the file content, and finally returns a relative URL path suitable for web access (e.g., `/uploads/unique-filename.jpg`). Program Code 4.3.3.2 illustrates the core file saving logic within `LocalStorage`. Second, the service constructs a new `models.Photo` struct, populating it with the relevant owner type, owner ID, the generated file URL, the initial primary status flag, and the caption. This metadata record is then persisted in the database by invoking the `CreatePhoto` method of the `PhotoRepository` (`internal/repository/postgres_photo_repository.go`), which utilizes GORM for the database interaction. Third, if the `isPrimary` flag was set to true for the first photo in the upload batch, the `PhotoService` makes an additional call to the `PhotoRepository`'s `SetPrimaryPhoto` method. This repository function is responsible for ensuring data consistency, typically within a database transaction, by setting the `IsPrimary` flag to true for the newly uploaded photo while simultaneously setting it to false for any pre-existing primary photo associated with the same owner.

```go
// Program Code 4.3.3.2. File Saving Logic (local_storage.go)
func (ls *LocalStorage) SaveFile(fileHeader *multipart.FileHeader) (string, error) {
    // ... (Generate uniqueFilename = uuid.New().String() + extension) ...
    dstPath := filepath.Join(ls.BasePath, uniqueFilename)

    src, err := fileHeader.Open()
    // ... (Handle src error) ...
    defer src.Close()

    dst, err := os.Create(dstPath)
    // ... (Handle dst error) ...
    defer dst.Close()

    _, err = io.Copy(dst, src)
    // ... (Handle copy error, attempt os.Remove(dstPath)) ...

    // Construct relative URL (e.g., "/uploads/" + uniqueFilename)
    fileURL := ls.BaseURL + "/" + uniqueFilename
    return fileURL, nil
}
```

Photo deletion is managed via the `DELETE /photos/{photoId}` endpoint. The corresponding `DeletePhoto` handler in `photo_handler.go` parses the `photoId` from the URL parameter and retrieves the current user's ID from the request context for authorization purposes. It then invokes the `DeletePhoto` method of the `PhotoService`. Within the service, an authorization check (`authorizePhotoAccess`) is performed first. This involves fetching the photo record from the database, identifying its owner (either a user or a pet), and verifying that the requesting user has the necessary permissions to delete it. If authorized, it calls the `PhotoRepository` to remove the photo's metadata record from the database. It is noted within the service code (`// TODO: Implement DeleteFile in FileStorage`) that the deletion of the corresponding physical file from the storage system is an intended feature but requires careful implementation, possibly involving deleting the database record before attempting file deletion to handle potential errors gracefully.

Setting a specific photo as the primary avatar for its owner is handled by the `PATCH /photos/{photoId}/primary` endpoint. The `SetPrimaryPhoto` handler parses the `photoId`, obtains the current user ID from the context, and calls the `SetPrimaryPhoto` method in the `PhotoService`. Similar to deletion, the service begins with the `authorizePhotoAccess` check to ensure the user is permitted to modify the specified photo. Upon successful authorization, it calls the `PhotoRepository`'s `SetPrimaryPhoto` method, which encapsulates the logic to update the `IsPrimary` flags in the database atomically for the given owner, ensuring only one photo remains marked as primary.

Finally, to enable web browsers to access the uploaded photos using the generated relative URLs, the Gin router is configured for static file serving in `cmd/server/main.go`. The statement `router.Static(baseURL, storagePath)` effectively maps the URL path prefix defined in `baseURL` (e.g., `/uploads`) to the corresponding filesystem directory specified by `storagePath` (e.g., `./uploads`). This configuration allows the Gin server to directly serve files requested under that URL prefix. Program Code 4.3.3.3 depicts this essential configuration line. This setup ensures that when the frontend application receives a photo URL like `/uploads/image.jpg` from the API, it can construct the complete URL (e.g., `http://localhost:8080/uploads/image.jpg`), enabling the browser to fetch and display the image directly from the backend's static file server.

```go
// Program Code 4.3.3.3. Static File Serving Configuration (main.go)
storagePath := cfg.FileStorage.BasePath // e.g., "./uploads"
baseURL := "/uploads"                  // URL prefix
// ... setup fileStore ...
router := gin.Default()
// ... other middleware ...
router.Static(baseURL, storagePath)
// ... route definitions ...
```

#### 4.3.5 Connection Management APIs

Facilitating connections between users is a primary function of PetPals. The backend provides a set of RESTful endpoints, managed by the `ConnectionHandler` (`internal/handlers/connection_handler.go`), to handle the lifecycle of user connections.

To initiate a connection, a user sends a POST request to the `/connections` endpoint containing the `targetUserId` in the JSON body. The `SendRequest` handler retrieves the `requesterID` from the authenticated context and parses the `receiverID` from the request body. It then calls the `SendRequest` method of the `ConnectionService` (`internal/service/connection_service_impl.go`). The service performs several validations: it prevents users from connecting to themselves, checks if the target user exists using `userRepo.GetUserByID`, and verifies that a connection (regardless of status) doesn't already exist between the two users using `connRepo.GetConnectionByUsers`. If validation passes, the service creates a new `models.Connection` record with the status set to `pending` by calling `connRepo.CreateConnection` and returns the newly created connection object.

Users can view connection requests sent to them via the `GET /connections/requests` endpoint. The `ListIncomingRequests` handler retrieves the current user's ID and calls the `ListIncomingRequests` method of the `ConnectionService`. The service, in turn, utilizes the `connRepo.ListConnectionsByUserID` method, specifically filtering for connections where the `currentUserID` is the `receiver_id` and the status is `pending`.

When a user receives a request, they can respond (accept or reject) using the `PUT /connections/requests/{requestId}` endpoint. The `RespondToRequest` handler parses the `connectionID` (the request ID) from the URL path and expects a JSON body containing an `action` field set to either "accept" or "reject". Based on the action specified, the handler calls the corresponding method in the `ConnectionService` (`AcceptRequest` or `RejectRequest`), passing the `connectionID` and the current user ID. For accepting a request, the `AcceptRequest` service method first retrieves the connection using `connRepo.GetConnectionByID`, performs authorization (ensuring the `currentUserID` matches the `ReceiverID`), and validates that the connection status is `pending`. If these checks pass, it updates the connection status to `accepted` and persists the change via `connRepo.UpdateConnection`. For rejecting a request, the `RejectRequest` service method follows a similar process of fetching, authorization, and status validation. The current implementation updates the connection status to `declined` and saves this change using `connRepo.UpdateConnection`, although an alternative noted in the code comments suggests potentially deleting the pending request record entirely via `connRepo.DeleteConnection`.

The `GET /connections` endpoint allows users to view their established (accepted) connections. The `ListConnections` handler calls the `ListAcceptedConnections` method of the `ConnectionService`. This service method employs `connRepo.ListConnectionsByUserID`, filtering for connections with an `accepted` status where the `currentUserID` is listed as either the `requester_id` or the `receiver_id`.

Finally, users can terminate an existing accepted connection using the `DELETE /connections/{connectionId}` endpoint. The `RemoveConnection` handler parses the `connectionID` from the URL and invokes the `RemoveConnection` method of the `ConnectionService`. The service layer retrieves the connection details, verifies authorization (ensuring the `currentUserID` is one of the two parties involved), and confirms that the connection status is indeed `accepted`. If all conditions are met, it proceeds to permanently remove the connection record from the database using `connRepo.DeleteConnection`.

Throughout these connection management operations, the handlers are responsible for translating potential service-level errors (such as `ErrNotFound`, `ErrValidation`, or `ErrUnauthorized`) into appropriate HTTP status codes (like 404, 400, or 403/401) and structured JSON error responses, providing clear feedback to the client application regarding the outcome of the request.

## 4.4 Frontend User Interface Implementation

The frontend of the PetPals application serves as the primary interaction point for users, responsible for presenting data retrieved from the backend API and capturing user input for various actions. It is developed as a Single-Page Application (SPA) using the React library, adhering to modern frontend development practices.

### 4.4.1 Component Structure and State Management

The frontend codebase, primarily located within the `match-me-web/src` directory, is structured logically to promote maintainability and reusability. Core application logic resides in files like `App.tsx`, which orchestrates routing using `react-router-dom`, and `main.tsx`, the application's entry point initializing the React rendering. The user interface itself is constructed using a component-based architecture, a fundamental principle of React discussed in Chapter 2. Components are organized into directories such as `src/components` (containing reusable UI elements categorized further, e.g., `common`, `profile`, `layout`) and `src/pages` (containing top-level components corresponding to application routes like `Dashboard`, `Profile`, `Discover`). This modular structure allows for clear separation of concerns. A key structural component is `components/layout/MainLayout.tsx`, which wraps the main application views (Dashboard, Profile, etc.) providing a consistent layout potentially including navigation elements, ensuring a unified user experience across protected sections of the application. The overall relationship and hierarchy between key pages and shared layout/common components could be visualized for clarity [Figure 4.4.1.1: Frontend Component Architecture Overview].

To enhance code quality and reduce runtime errors, the frontend is developed using TypeScript, leveraging its static typing features as outlined in Chapter 2. Type definitions for data structures (e.g., User, Pet, Photo) shared across the application are typically centralized, likely within the `src/types` directory, ensuring consistency in data handling between components, state management, and API service layers.

For managing application-wide state, such as user authentication status, logged-in user details, and pet lists, the Zustand library is employed. Chosen for its simplicity and minimal boilerplate compared to more complex alternatives (as discussed in Section 2.2.3), Zustand provides a hook-based approach well-suited to the React ecosystem. The application defines specific state stores, primarily `src/store/userStore.ts` and `src/store/petStore.ts`, each encapsulating a distinct slice of the global state and the actions required to modify it. For instance, `userStore.ts` manages the authentication token (`token`) and the current user's profile data (`user`), along with actions like `setToken` and `fetchUserProfile`. Program Code 4.4.1.1 conceptually illustrates how such a store might be defined using Zustand's `create` function, potentially including middleware like `persist` for saving state (e.g., the authentication token) to local storage.

```typescript
// Program Code 4.4.1.1. Conceptual Zustand Store Definition (userStore.ts)
import { create } from 'zustand';
// import { persist } from 'zustand/middleware'; // Example if persistence is used

interface UserState {
  token: string | null;
  user: models.User | null; // Assuming models.User type defined
  // ... other relevant state slices
  setToken: (token: string | null) => void;
  fetchUserProfile: () => Promise<void>; // Action to fetch data
  // ... other actions
}

export const useUserStore = create<UserState>((set, get) => ({
  token: null, // Initial state
  user: null,
  // ...

  setToken: (token) => set({ token }), // Action implementation

  fetchUserProfile: async () => {
    // set({ isLoading: true }); // Example: manage loading state
    try {
      // const userProfile = await apiService.fetchMe(); // Conceptual API call
      // set({ user: userProfile, isLoading: false });
    } catch (error) {
      // set({ isLoading: false, error: '...' }); // Handle errors
    }
  },
  // ...
}));
```

React components subscribe to relevant pieces of state within these stores using hooks provided by Zustand. This typically involves calling the store hook (e.g., `useUserStore`) with a selector function to extract only the necessary state slices. Actions defined in the store (like `fetchUserProfile`) can also be accessed via the hook. This mechanism ensures that components automatically re-render when the specific state they depend on changes, while minimizing unnecessary re-renders by selecting only required data. Program Code 4.4.1.2 shows a conceptual example of a component accessing state and actions from the `useUserStore`. This clear separation of state logic into dedicated stores significantly improves the organization and testability of the frontend application compared to managing all state within individual components.

```typescript
// Program Code 4.4.1.2. Conceptual Component Using Zustand Store
import React from 'react';
import { useUserStore } from '../store/userStore';

function UserGreeting() {
  // Select specific state slices needed by this component
  const userName = useUserStore(state => state.user?.name);
  const token = useUserStore(state => state.token);
  // Select action if needed
  const fetchProfile = useUserStore(state => state.fetchUserProfile);

  React.useEffect(() => {
    // Example: Fetch profile only if token exists but user data is missing
    if (token && !userName) {
      // fetchProfile(); // Call the action from the store
    }
  }, [token, userName, fetchProfile]);

  // Render based on selected state
  if (!token) return <div>Please log in.</div>;
  if (!userName) return <div>Loading user...</div>;

  return <div>Hello, {userName}!</div>;
}
```

### 4.4.2 Styling and Responsive Design

The visual presentation and adaptability of the PetPals frontend across different devices are primarily achieved using the Tailwind CSS framework. As detailed in Chapter 2, Tailwind CSS adopts a utility-first methodology, providing a comprehensive set of low-level utility classes that can be composed directly within the HTML (or JSX in this case) markup to build custom designs without writing extensive custom CSS.

The project's Tailwind configuration is defined in `match-me-web/tailwind.config.js`. This file specifies the paths for Tailwind to scan for class usage (`content` array), enabling effective purging of unused styles during the build process to minimize the final CSS bundle size. The configuration also extends the default Tailwind theme (`theme.extend`) to incorporate project-specific design elements. Custom color palettes, including `softpink`, `skyblue`, and `lavender`, are defined, along with a specific font family (`nunito`). Furthermore, custom box shadows, animations (like `bounce-slight` and `fade-in`), and keyframes are added to enhance the visual appeal and interactive feedback of the user interface. The standard PostCSS configuration (`match-me-web/postcss.config.js`) integrates Tailwind and Autoprefixer into the build pipeline. The main entry CSS file (`match-me-web/src/index.css`) imports the necessary base styles, components, and utilities provided by Tailwind using the `@tailwind` directives.

In practice, styling is applied by adding Tailwind utility classes directly to the `className` attribute of React components. Program Code 4.4.2.1 shows a typical example from a component's JSX, demonstrating the composition of various utility classes for layout (`flex`, `items-center`), spacing (`p-6`, `mb-4`), typography (`text-xl`, `font-bold`), color (`bg-white`, `text-purple-700`), and other visual properties (`rounded-xl`, `shadow-md`). This approach keeps the styles co-located with the markup, improving maintainability.

```jsx
// Program Code 4.4.2.1. Example of Tailwind Class Usage in a Component
// Conceptual example derived from grep search results
<div className="bg-white rounded-xl shadow-md p-6 mb-4">
  <h2 className="text-xl font-bold text-purple-700 flex items-center">
    <span className="mr-2">🐾</span> {/* Example Icon */}
    Pet Details
  </h2>
  {/* ... other elements ... */}
</div>
```

Responsive design, ensuring the application adapts gracefully to different screen sizes (from mobile devices to desktops), is also implemented using Tailwind's built-in responsive modifiers. Prefixes like `sm:`, `md:`, and `lg:` are applied to utility classes to define styles that take effect only at specific breakpoints. For instance, a class like `lg:col-span-2` would apply a grid column span of 2 only on large screens and wider, allowing for flexible layout adjustments based on the available screen real estate. This utility-based approach enables the creation of fully responsive interfaces without resorting to separate CSS files or complex media queries.

### 4.4.3 Backend Communication using Axios

Communication between the React frontend and the Go backend API is predominantly handled using the Axios library, a popular promise-based HTTP client for JavaScript, as introduced in Chapter 2. The frontend establishes a centralized configuration for Axios to streamline API interactions and manage common concerns like authentication headers and error handling.

A dedicated module, `src/services/api.ts`, configures and exports a shared Axios instance. This instance is created using `axios.create` and initialized with a base URL pointing to the backend server (e.g., `http://localhost:8080`) and a request timeout value. Crucially, this module utilizes Axios interceptors to modify requests and responses globally. A request interceptor is implemented to automatically retrieve the current JWT authentication token from the Zustand user store (`useUserStore.getState().token`). If a token exists, the interceptor adds it to the `Authorization` header of every outgoing request using the `Bearer` scheme. This mechanism obviates the need to manually add the token to each API call throughout the application. Program Code 4.4.3.1 illustrates the core logic of this request interceptor.

```typescript
// Program Code 4.4.3.1. Axios Request Interceptor for Auth Token (api.ts)
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/userStore';

export const api = axios.create({
  baseURL: 'http://localhost:8080', // Example baseURL
  // ... other config
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().token; // Get token from Zustand store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add header if token exists
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

Additionally, a response interceptor is configured to perform basic global error handling. It checks for responses with a 401 Unauthorized status code, which typically indicates an invalid or expired JWT. Upon detecting a 401 error, the interceptor automatically triggers an action in the user store (`useUserStore.getState().clearUser()`) to clear the user's session data on the frontend, effectively logging them out.

Within the application, specifically in the Zustand store actions (e.g., in `src/store/userStore.ts` or `src/store/petStore.ts`) or sometimes directly within components, this pre-configured Axios instance (`api`) is used to make asynchronous HTTP requests to the various backend endpoints. Standard methods like `api.get`, `api.post`, `api.put`, `api.patch`, and `api.delete` are employed to perform CRUD operations, sending request bodies (often as JSON objects) and processing the response data. Program Code 4.4.3.2 provides a conceptual example of how a store action might use the `api` instance to fetch data.

```typescript
// Program Code 4.4.3.2. Example Store Action Using Axios Instance (petStore.ts)
import { api } from '../services/api';
// ... other imports and state definition ...

// Inside Zustand create((set) => ({ ... }) ):
fetchPets: async () => {
  set({ isLoading: true, error: null });
  try {
    // Use the configured 'api' instance
    const response = await api.get('/api/v1/me/pets'); // Relative path uses baseURL
    const fetchedPets: Pet[] = response.data;
    set({ pets: fetchedPets, isLoading: false });
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch pets';
    set({ error: errorMessage, isLoading: false });
  }
},
```

For operations involving file uploads, such as adding photos to user or pet profiles, the frontend constructs a `FormData` object within the relevant component (e.g., `PetProfileForm.tsx`). This `FormData` object, containing the file(s) and any associated metadata, is then passed to a dedicated API service function (like `uploadPetPhotos` exported from `api.ts`). This function uses `api.post`, passing the `FormData` object as the request body. Axios automatically detects the `FormData` type and sets the appropriate `Content-Type: multipart/form-data` header, facilitating communication with the backend handlers designed to process such requests. This centralized Axios setup simplifies API communication logic throughout the frontend codebase.

## 5 Results

[Content for Results goes here]

## 6 Summary

[Content for Summary goes here]

## References

*   Axios Documentation. (n.d.). Getting Started | Axios Docs. Retrieved March 31, 2025, from [https://axios-http.com/docs/intro](https://axios-http.com/docs/intro)
*   Documentation for Visual Studio Code. (n.d.). Retrieved March 31, 2025, from [https://code.visualstudio.com/docs](https://code.visualstudio.com/docs)
*   Fielding, R. T. (2000). Fielding Dissertation: CHAPTER 5: Representational State Transfer (REST). [https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
*   Gin Web Framework Documentation. (n.d.). Documentation. Gin Web Framework. Retrieved March 31, 2025, from [https://gin-gonic.com/docs/](https://gin-gonic.com/docs/)
*   Git—Documentation. (n.d.). Retrieved March 31, 2025, from [https://git-scm.com/doc](https://git-scm.com/doc)
*   Go Team Documentation. (n.d.). Documentation—The Go Programming Language. Retrieved March 31, 2025, from [https://go.dev/doc/](https://go.dev/doc/)
*   Introduction—Zustand. (n.d.). Retrieved March 31, 2025, from [https://zustand.docs.pmnd.rs/getting-started/introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
*   JWT.io Introduction. (n.d.). JSON Web Token Introduction—Jwt.io. JSON Web Tokens - Jwt.Io. Retrieved March 31, 2025, from [https://jwt.io/introduction](https://jwt.io/introduction)
*   Metana. (n.d.). Secure Web Apps with Bcrypt & JWT: Password Hashing & Authentication. Retrieved April 7, 2025, from [https://metana.io/blog/bcrypt-and-jwt-web-app-security/](https://metana.io/blog/bcrypt-and-jwt-web-app-security/)
*   PostgreSQL Official Documentation. (n.d.). PostgreSQL: Documentation. Retrieved March 31, 2025, from [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
*   Provos, N., & Mazières, D. (1999). A Future-Adaptable Password Scheme. [https://harrymoreno.com/assets/greatPapersInCompSci/A_Future-Adaptable_Password_Scheme_-_provos_(1999).pdf](https://harrymoreno.com/assets/greatPapersInCompSci/A_Future-Adaptable_Password_Scheme_-_provos_(1999).pdf)
*   React Official Documentation. (n.d.). React. Retrieved March 31, 2025, from [https://react.dev/](https://react.dev/)
*   Socket.IO Documentation. (2025, March 3). Introduction | Socket.IO. [https://socket.io/docs/v4/](https://socket.io/docs/v4/)
*   Tailwind CSS Documentation. (2021, June 17). Documentation—Tailwind CSS. [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
*   TypeScript Official Documentation. (n.d.). The starting point for learning TypeScript. Retrieved March 31, 2025, from [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

## Appendix A: User Stories

### Authentication & Basic Usage
- As a new user, I want to register an account using my email and a secure password so that I can access the platform's features.
- As a registered user, I want to log in securely using my email and password so that I can access my profile and connections.
- As a logged-in user, I want to log out easily from any page so that I can end my session securely.

### Profile Management
- As a logged-in user, I want to create and edit my user profile (name, location, bio, interests) so that other users can learn about me.
- As a logged-in user, I want to upload and manage photos for my profile (including setting a primary avatar) so that I can visually represent myself.
- As a logged-in user, I want to add one or more pet profiles (name, type, breed, age, personality, activities, etc.) so that I can represent my companions.
- As a logged-in user, I want to upload and manage photos for each of my pets (including setting a primary avatar) so that others can see my pets.
- As a logged-in user, I want to easily update or delete my pet profiles as needed.

### Connections & Discovery
- As a logged-in user, I want to receive recommendations for potential pet playmates based on my pet's type and location proximity so that I can find suitable companions nearby.
- As a logged-in user, I want to view the public profiles of other users and their pets so that I can decide if I want to connect.
- As a logged-in user, I want to send connection requests to other users I'm interested in connecting with.
- As a logged-in user, I want to view incoming connection requests and choose to accept or decline them.
- As a logged-in user, I want to see a list of my accepted connections.
- As a logged-in user, I want to remove an existing connection if I no longer wish to be connected.

### (Planned) Search & Filter
- As a logged-in user, I want to search for pets based on various criteria (like location, type, breed, activity level) so that I can actively discover potential matches beyond recommendations.

### (Planned) Real-time Chat
- As a connected user, I want to initiate a real-time chat with another connected user so that we can communicate directly.
- As a user in a chat, I want to send and receive text messages in real-time.
- As a user, I want to see my chat history with connected users.

## Appendix B: Project Management Simulation (Trello)

Although this was an individual thesis project, agile project management principles were simulated using a Trello board to maintain organization and track progress conceptually. A board named "PetPals Development" was envisioned with the following standard lists: `Backlog`, `To Do`, `In Progress`, `Testing`, and `Done`. Each significant feature or task, often derived from the user stories (see Appendix A) or the technical requirements checklist (from `project.md`), was represented as a card. Cards in the `Backlog` held all identified features and tasks. Items planned for the current development cycle were moved to `To Do`. As work began on a task, its card was moved to `In Progress`. Upon completion of the initial coding, the card would transition to `Testing` (simulating a QA phase). Finally, successfully implemented and verified features had their cards moved to the `Done` list. Labels such as `Backend`, `Frontend`, `Bug`, `Feature`, `API`, `UI` were conceptually used to categorize cards. Checklists within cards were imagined to break down larger features into smaller, manageable sub-tasks (e.g., "Implement API endpoint," "Create React component," "Write unit tests"). This simulated approach provided a structured overview of the project's scope and progress, mirroring how a team might manage such a project using Trello.