# SolidJS File Manager Components

This document provides an overview of the key components in the SolidJS File Manager application and explains how they interact to create a Solid-based file management system.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
   - [AuthenticationManager](#authenticationmanager)
   - [FileExplorer](#fileexplorer)
   - [ContainerManager](#containermanager)
   - [ResourceViewer](#resourceviewer)
   - [Services](#services)
3. [Component Interactions](#component-interactions)
4. [Data Flow](#data-flow)
5. [Authentication Flow](#authentication-flow)

## Architecture Overview

The SolidJS File Manager application is built on the Solid (Social Linked Data) platform, which provides a decentralized data storage model where users maintain control over their personal data. The application follows a component-based architecture using SolidJS for the frontend, with the Solid Client libraries for interacting with Solid Pods.

```
┌─────────────────────────────────────────────────────────────┐
│                 SolidJS File Manager App                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ Authentication  │───>│ FileExplorer│───>│ Container   │  │
│  │ Manager         │    │             │    │ Manager     │  │
│  └─────────────────┘    └─────────────┘    └─────────────┘  │
│         │                      │                 │          │
│         │                      │                 │          │
│         ▼                      ▼                 ▼          │
│  ┌─────────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ authService     │    │ fileService │    │ Resource    │  │
│  │                 │    │             │    │ Viewer      │  │
│  └─────────────────┘    └─────────────┘    └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       Solid Server                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ User's Pod  │    │ Containers  │    │ Resources       │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### AuthenticationManager

**Purpose**: Handles user authentication with the Solid server and manages login/logout functionality.

**Key Responsibilities**:
- Authenticates users with their Solid identity provider
- Manages login and logout processes
- Provides user session information to other components
- Handles session restoration on page refresh

**Implementation Details**:
- Uses `@inrupt/solid-client-authn-browser` for authentication
- Implements the OIDC authentication flow
- Stores session information in memory
- Provides login status and WebID to parent components

### FileExplorer

**Purpose**: Provides an interface for browsing and managing the user's Solid Pod.

**Key Responsibilities**:
- Displays the contents of containers in the user's Pod
- Allows navigation through the Pod's directory structure
- Enables creation of new containers and resources
- Provides functionality to delete resources

**Implementation Details**:
- Uses `getSolidDataset` and `getContainedResourceUrlAll` to fetch container contents
- Implements breadcrumb navigation for Pod exploration
- Provides a UI for creating and deleting containers and resources
- Handles different resource types appropriately

### ContainerManager

**Purpose**: Manages containers within the user's Solid Pod.

**Key Responsibilities**:
- Creates new containers
- Deletes existing containers
- Displays container metadata
- Handles container permissions

**Implementation Details**:
- Uses `createContainerAt` to create new containers
- Uses `deleteContainer` to delete containers
- Implements error handling for container operations
- Provides a UI for container management

### ResourceViewer

**Purpose**: Displays and manages resources within containers.

**Key Responsibilities**:
- Displays resource content based on its type
- Allows editing of text-based resources
- Provides download functionality for binary resources
- Displays resource metadata

**Implementation Details**:
- Uses content-type negotiation to handle different resource types
- Implements viewers for common resource types (text, images, etc.)
- Provides a UI for resource management
- Handles resource metadata using Dublin Core Terms vocabulary

### Services

#### authService

**Purpose**: Provides utility functions for authentication.

**Key Functions**:
- `login`: Initiates the login process
- `logout`: Logs the user out
- `getSession`: Gets the current session information
- `restoreSession`: Attempts to restore a previous session

#### fileService

**Purpose**: Provides utility functions for file operations.

**Key Functions**:
- `getContainerContents`: Gets the contents of a container
- `createContainer`: Creates a new container
- `deleteResource`: Deletes a resource
- `getResourceContent`: Gets the content of a resource
- `saveResourceContent`: Saves the content of a resource

## Component Interactions

The components interact in the following ways:

1. **Authentication Flow**:
   - User enters their Solid identity provider URL in the `AuthenticationManager`
   - `AuthenticationManager` authenticates with the Solid server
   - Upon successful login, `AuthenticationManager` provides the session information to other components

2. **File Exploration Flow**:
   - `FileExplorer` loads the contents of the user's Pod
   - User navigates through containers using the breadcrumb navigation
   - `FileExplorer` displays the contents of the selected container
   - User can create, view, or delete resources using the `ContainerManager` and `ResourceViewer`

## Data Flow

```
┌─────────────────┐     ┌─────────────┐     ┌─────────────┐
│ Authentication  │────>│ authService │────>│ Solid Server│
│ Manager         │     │             │     │             │
└─────────────────┘     └─────────────┘     └─────────────┘
       │                                           ▲
       │                                           │
       ▼                                           │
┌─────────────────┐     ┌─────────────┐     ┌─────────────┐
│ FileExplorer    │────>│ fileService │────>│ User's Pod  │
└─────────────────┘     └─────────────┘     └─────────────┘
       │                                           ▲
       │                                           │
       ▼                                           │
┌─────────────────┐     ┌─────────────┐     ┌─────────────┐
│ ContainerManager│────>│ Resource    │────>│ Resources   │
└─────────────────┘     │ Viewer      │     │             │
                        └─────────────┘     └─────────────┘
```

## Authentication Flow

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐
│  User    │────>│ Authentication│────>│  Solid Server │
│          │     │ Manager       │     │               │
└──────────┘     └───────────────┘     └───────────────┘
                        │                      │
                        │                      │
                        ▼                      ▼
                 ┌───────────────┐     ┌───────────────┐
                 │  authService  │<────│  User's WebID │
                 └───────────────┘     └───────────────┘
                        │
                        │
                        ▼
                 ┌───────────────┐
                 │ FileExplorer  │
                 │               │
                 └───────────────┘
```

## Conclusion

The SolidJS File Manager application is built on a component-based architecture that leverages the Solid platform for decentralized data storage. The key components work together to provide authentication, file exploration, and resource management functionality, allowing users to interact with their Solid Pods in a user-friendly way. 