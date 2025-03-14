# WellData Application Components

This document provides an overview of the key components in the WellData application and explains how they interact to create a Solid-based preventive health data management system.

## Introduction

WellData is designed to enable citizens to manage their own preventive health data in a SOLID Pod, while also enabling secondary use of such data for policy makers and researchers. It represents a prototype implementation of a European Health Data Space focused on preventive health.

The application is built on the Solid (Social Linked Data) platform, which provides a decentralized data storage model where users maintain control over their personal data. This aligns perfectly with the vision of citizen-controlled health data that can be shared across multiple health applications without duplication.

In the future, WellData will be augmented with features such as:
- Leaderboards to promote user onboarding and data solidarity
- Personal health goals management
- Integration with existing health applications like Selfcare, Zipster, and Bibopp

The components described in this document form the foundation for these future features, with a focus on creating and managing the welldata container structure in the user's SOLID Pod.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
   - [AuthManager](#authmanager)
   - [PodManager](#podmanager)
   - [ContainerManager](#containermanager)
   - [WelldataPodCreator](#welldatapodcreator)
   - [Services](#services)
3. [Component Interactions](#component-interactions)
4. [Data Flow](#data-flow)
5. [Authentication Flow](#authentication-flow)
6. [Container Creation Flow](#container-creation-flow)

## Architecture Overview

The WellData application follows a component-based architecture using React and Chakra UI for the frontend, with the Solid Client libraries for interacting with Solid Pods.

```
┌─────────────────────────────────────────────────────────────┐
│                     WellData Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ AuthManager │───>│ PodManager  │───>│ ContainerManager│  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│         │                  │                   │            │
│         │                  │                   │            │
│         ▼                  ▼                   ▼            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ podService  │    │ fhirService │    │ WelldataPod     │  │
│  │             │    │             │    │ Creator         │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
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

### AuthManager

**Purpose**: Handles user authentication with the Solid server and manages login/logout functionality.

**Key Responsibilities**:
- Authenticates users with their Solid identity provider
- Manages login and logout processes
- Initializes the welldata container structure upon login
- Provides user session information to other components

**Implementation Details**:
- Uses `@inrupt/solid-client-authn-browser` for authentication
- Extracts the Pod URL from the user's WebID
- Ensures the welldata container structure exists in the user's Pod
- Provides login status and WebID to parent components

```typescript
// Key methods in AuthManager
const ensureWelldataStructureOnLogin = async (webId: string) => {
  // Extract the Pod container URL from the WebID
  // Create welldata structure if it doesn't exist
};

const handleLogin = async () => {
  // Authenticate with Solid server
};

const handleLogout = async () => {
  // Log out from Solid server
};
```

### PodManager

**Purpose**: Provides an interface for browsing and managing the user's Solid Pod.

**Key Responsibilities**:
- Displays the contents of containers in the user's Pod
- Allows navigation through the Pod's directory structure
- Enables creation of new containers
- Provides functionality to delete resources
- Checks for the existence of the welldata container

**Implementation Details**:
- Uses `getSolidDataset` and `getContainedResourceUrlAll` to fetch container contents
- Implements breadcrumb navigation for Pod exploration
- Provides a UI for creating and deleting containers
- Checks for the welldata container in the Pod

```typescript
// Key methods in PodManager
const loadContainer = async (url: string) => {
  // Fetch and display container contents
};

const checkWelldataContainer = async (podUrl: string) => {
  // Check if welldata container exists in the Pod
};

const createNewContainer = async () => {
  // Create a new container in the current location
};
```

### ContainerManager

**Purpose**: Manages containers within the user's Solid Pod, with a focus on the welldata container.

**Key Responsibilities**:
- Displays containers in the user's Pod
- Allows creation of new containers
- Provides functionality to delete containers
- Extracts the Pod URL from the user's WebID

**Implementation Details**:
- Uses the URL constructor to properly parse WebIDs
- Implements error handling for WebID parsing
- Provides a UI for container management
- Extracts container names for display

```typescript
// Key methods in ContainerManager
const fetchContainers = async (url: string) => {
  // Fetch containers from the specified URL
};

const createContainer = async () => {
  // Create a new container
};

const getContainerName = (url: string): string => {
  // Extract container name from URL for display
};
```

### WelldataPodCreator

**Purpose**: Creates the welldata container structure in the user's Pod.

**Key Responsibilities**:
- Creates the welldata container in the user's Pod
- Sets up the required subcontainers (data, plans, etc.)
- Creates a WebID for the welldata container
- Creates an initial FHIR plan

**Implementation Details**:
- Extracts the Pod container URL from the user's WebID
- Creates the welldata container and its subcontainers
- Creates a WebID for the welldata container
- Initializes the container with an initial FHIR plan

```typescript
// Key methods in WelldataPodCreator
const createWelldataContainer = async () => {
  // Extract Pod URL from WebID
  // Create welldata container and subcontainers
  // Create WebID and initial FHIR plan
};

const createWelldataWebId = async (containerUrl: string) => {
  // Create a WebID for the welldata container
};
```

### Services

#### podService

**Purpose**: Provides utility functions for working with Solid Pods.

**Key Functions**:
- `ensureWelldataStructure`: Ensures the welldata container structure exists
- `resourceExists`: Checks if a resource exists
- `deleteContainerRecursively`: Recursively deletes a container and its contents
- `createWelldataWebId`: Creates a WebID for the welldata container

#### fhirService

**Purpose**: Handles FHIR-related functionality.

**Key Functions**:
- `createInitialFHIRPlan`: Creates an initial FHIR plan in the welldata container
- `getFHIRPlan`: Retrieves a FHIR plan from the welldata container
- `convertToFHIRJSON`: Converts a FHIR plan to JSON format
- `downloadFHIRJSON`: Downloads a FHIR plan as a JSON file

## Component Interactions

The components interact in the following ways:

1. **Authentication Flow**:
   - User enters their Solid identity provider URL in the `AuthManager`
   - `AuthManager` authenticates with the Solid server
   - Upon successful login, `AuthManager` calls `ensureWelldataStructureOnLogin`
   - `ensureWelldataStructureOnLogin` uses `podService.ensureWelldataStructure` to create the welldata structure if needed

2. **Pod Management Flow**:
   - `PodManager` loads the contents of the user's Pod
   - User navigates through containers using the breadcrumb navigation
   - `PodManager` checks for the welldata container using `checkWelldataContainer`
   - If the welldata container doesn't exist, `PodManager` displays the `WelldataPodCreator`

3. **Container Creation Flow**:
   - User clicks "Create Welldata Container" in the `WelldataPodCreator`
   - `WelldataPodCreator` extracts the Pod URL from the user's WebID
   - `WelldataPodCreator` creates the welldata container and its subcontainers
   - `WelldataPodCreator` creates a WebID for the welldata container
   - `WelldataPodCreator` creates an initial FHIR plan using `fhirService.createInitialFHIRPlan`

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ AuthManager │────>│ podService  │────>│ Solid Server│
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       ▲
       │                                       │
       ▼                                       │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ PodManager  │────>│ WellData    │────>│ fhirService │
└─────────────┘     │ PodCreator  │     └─────────────┘
       │            └─────────────┘            │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                   Solid Pod                          │
└─────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐
│  User    │────>│  AuthManager  │────>│  Solid Server │
└──────────┘     └───────────────┘     └───────────────┘
                        │                      │
                        │                      │
                        ▼                      ▼
                 ┌───────────────┐     ┌───────────────┐
                 │  podService   │<────│  User's WebID │
                 └───────────────┘     └───────────────┘
                        │
                        │
                        ▼
                 ┌───────────────┐
                 │ Welldata      │
                 │ Structure     │
                 └───────────────┘
```

## Container Creation Flow

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐
│  User    │────>│ WellData      │────>│  podService   │
└──────────┘     │ PodCreator    │     └───────────────┘
                 └───────────────┘            │
                        │                     │
                        │                     ▼
                        │              ┌───────────────┐
                        │              │ Solid Server  │
                        │              └───────────────┘
                        │                     │
                        ▼                     ▼
                 ┌───────────────┐     ┌───────────────┐
                 │ fhirService   │────>│ Welldata      │
                 └───────────────┘     │ Container     │
                                       └───────────────┘
```

## Key Implementation Details

### WebID Extraction

One of the critical aspects of the application is correctly extracting the Pod container URL from the user's WebID. This is done in multiple components:

```typescript
// Extract the Pod container URL from the WebID
// WebID format is typically: http://localhost:3000/alice/profile/card#me
// Pod container is typically: http://localhost:3000/alice/
const webIdUrl = new URL(webId);
const pathParts = webIdUrl.pathname.split('/').filter(Boolean);

let podUrl = '';
// The first part of the path is usually the username/pod name
if (pathParts.length > 0) {
  podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
} else {
  // Fallback to the root URL if we can't extract from WebID
  podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
}
```

### Container Structure

The welldata container has a specific structure:

```
welldata/
├── data/
│   └── plans/
│       └── initial-plan.ttl
├── config/
├── logs/
└── metadata/
```

This structure is created by the `WelldataPodCreator` component and the `ensureWelldataStructure` function in the `podService`.

### FHIR Plan Creation

The initial FHIR plan is created using the `createInitialFHIRPlan` function in the `fhirService`:

```typescript
export async function createInitialFHIRPlan(podUrl: string): Promise<void> {
  // Create a new dataset for the FHIR plan
  const planDataset = createSolidDataset();
  
  // Create the initial plan thing with all required fields
  const planThing = buildThing(createThing({ name: 'initial-plan' }))
    .addStringNoLocale(FHIR_NAMESPACE('title'), 'WellData Health Engagement Plan')
    .addStringNoLocale(FHIR_NAMESPACE('description'), 'Plan for engaging with WellData apps to maintain and improve health')
    // ... additional properties
    .build();

  // Add the plan thing to the dataset
  const updatedDataset = setThing(planDataset, planThing);

  // Save the dataset to the welldata Pod
  const planUrl = `${podUrl}data/plans/initial-plan.ttl`;
  await saveSolidDatasetAt(planUrl, updatedDataset, { fetch });
}
```

## Conclusion

The WellData application is built on a component-based architecture that leverages the Solid platform for decentralized data storage. The key components work together to provide authentication, Pod management, and container management functionality, with a focus on creating and managing the welldata container structure.

The application ensures that the welldata container is created inside the user's Pod container, rather than at the root level, by correctly extracting the Pod container URL from the user's WebID. This ensures proper organization of the user's data and follows the principles of the Solid platform. 