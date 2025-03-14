# WellData Technical Implementation Details

This document provides a detailed technical explanation of the key implementation aspects of the WellData application, focusing on WebID extraction, container creation, and the Solid integration.

## Table of Contents

1. [WebID Extraction Logic](#webid-extraction-logic)
2. [Container Creation Process](#container-creation-process)
3. [FHIR Data Structure](#fhir-data-structure)
4. [Error Handling](#error-handling)
5. [Debugging Features](#debugging-features)

## WebID Extraction Logic

### The WebID Format

In Solid, a WebID is a URI that uniquely identifies a user and typically follows this format:
```
http://localhost:3000/alice/profile/card#me
```

The WebID contains several important parts:
- Protocol: `http://` or `https://`
- Hostname: `localhost:3000`
- Username/Pod name: `alice`
- Path to profile document: `profile/card`
- Fragment identifier: `#me`

### Extracting the Pod Container URL

To correctly place the welldata container inside the user's Pod (rather than at the root level), we need to extract the Pod container URL from the WebID. This is done using the following logic:

```typescript
// Extract the Pod container URL from the WebID
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

This code:
1. Parses the WebID using the `URL` constructor
2. Splits the pathname into parts and filters out empty strings
3. Takes the first part of the path (usually the username/Pod name)
4. Constructs the Pod container URL using the protocol, hostname, port (if any), and the first path part
5. Falls back to the root URL if no path parts are found

### Implementation in Different Components

This WebID extraction logic is implemented in multiple components:

1. **AuthManager**: Extracts the Pod URL during login to ensure the welldata structure exists
2. **PodManager**: Extracts the Pod URL to load the correct container and check for the welldata container
3. **WelldataPodCreator**: Extracts the Pod URL to create the welldata container in the correct location
4. **podService**: Extracts the Pod URL to ensure the welldata structure exists in the correct location

## Container Creation Process

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

### Creation Process

The container creation process follows these steps:

1. **Extract Pod URL**: Extract the Pod container URL from the user's WebID
2. **Create Welldata Container**: Create the welldata container inside the Pod container
3. **Create Subcontainers**: Create the required subcontainers (data, plans, etc.)
4. **Create WebID**: Create a WebID for the welldata container
5. **Create Initial FHIR Plan**: Create an initial FHIR plan in the welldata container

### Implementation in WelldataPodCreator

```typescript
const createWelldataContainer = async () => {
  // Extract the Pod container URL from the WebID
  const webIdUrl = new URL(session.info.webId);
  const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
  
  let podContainerUrl = '';
  if (pathParts.length > 0) {
    podContainerUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
  } else {
    podContainerUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
  }
  
  // Create the welldata container in the Pod container
  const welldataContainerUrl = `${podContainerUrl}welldata/`;
  await createContainerAt(welldataContainerUrl, { fetch });
  
  // Create required subcontainers
  const dataContainerUrl = `${welldataContainerUrl}data/`;
  await createContainerAt(dataContainerUrl, { fetch });
  
  const plansContainerUrl = `${dataContainerUrl}plans/`;
  await createContainerAt(plansContainerUrl, { fetch });
  
  // Create a WebID for the welldata container
  await createWelldataWebId(welldataContainerUrl);
  
  // Create initial FHIR plan
  await createInitialFHIRPlan(welldataContainerUrl);
};
```

### Implementation in podService

The `ensureWelldataStructure` function in the `podService` follows a similar process but checks if each component exists before creating it:

```typescript
export async function ensureWelldataStructure(podUrl: string, options = { debug: false, createWebId: true }): Promise<{ success: boolean; welldataUrl: string; message: string }> {
  // Extract the Pod container URL from the WebID
  let podContainerUrl = '';
  try {
    const webIdUrl = new URL(session.info.webId);
    const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
    
    if (pathParts.length > 0) {
      podContainerUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
    } else {
      podContainerUrl = podUrl;
    }
  } catch (error) {
    podContainerUrl = podUrl;
  }
  
  // Determine the welldata container URL
  const welldataContainerUrl = `${podContainerUrl}welldata/`;
  
  // Check if welldata container exists, create if not
  let welldataExists = await resourceExists(welldataContainerUrl);
  if (!welldataExists) {
    await createContainerAt(welldataContainerUrl, { fetch });
  }
  
  // Check if data subdirectory exists, create if not
  const dataContainerUrl = `${welldataContainerUrl}data/`;
  let dataExists = await resourceExists(dataContainerUrl);
  if (!dataExists) {
    await createContainerAt(dataContainerUrl, { fetch });
  }
  
  // Check if plans subdirectory exists, create if not
  const plansContainerUrl = `${dataContainerUrl}plans/`;
  let plansExists = await resourceExists(plansContainerUrl);
  if (!plansExists) {
    await createContainerAt(plansContainerUrl, { fetch });
  }
  
  // Check if initial plan exists, create if not
  const initialPlanUrl = `${plansContainerUrl}initial-plan.ttl`;
  let initialPlanExists = await resourceExists(initialPlanUrl);
  if (!initialPlanExists) {
    await createInitialFHIRPlan(welldataContainerUrl);
  }
  
  // Create WebID for the welldata container if requested
  if (options.createWebId) {
    const webIdUrl = `${welldataContainerUrl}.ttl`;
    let webIdExists = await resourceExists(webIdUrl);
    if (!webIdExists) {
      await createWelldataWebId(welldataContainerUrl);
    }
  }
  
  return {
    success: true,
    welldataUrl: welldataContainerUrl,
    message: 'Welldata structure verified and completed successfully'
  };
}
```

## FHIR Data Structure

### FHIR Plan Format

The FHIR plan is stored as a Turtle (`.ttl`) file in the welldata container. It follows this structure:

```typescript
export interface FHIRPlan {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  created: Date;
  modified: Date;
  author: string;
  goal: string;
  target: {
    code: string;
    frequency: string;
  };
  actions: Array<{
    title: string;
    description: string;
    frequency: string;
  }>;
}
```

### Creating the Initial FHIR Plan

The initial FHIR plan is created using the `createInitialFHIRPlan` function in the `fhirService`:

```typescript
export async function createInitialFHIRPlan(podUrl: string): Promise<void> {
  // Create a new dataset for the FHIR plan
  const planDataset = createSolidDataset();
  
  // Create the initial plan thing with all required fields
  const planThing = buildThing(createThing({ name: 'initial-plan' }))
    .addStringNoLocale(FHIR_NAMESPACE('title'), 'WellData Health Engagement Plan')
    .addStringNoLocale(FHIR_NAMESPACE('description'), 'Plan for engaging with WellData apps to maintain and improve health')
    .addStringNoLocale(FHIR_NAMESPACE('status'), 'active')
    .addDate(FHIR_NAMESPACE('created'), new Date())
    .addDate(FHIR_NAMESPACE('modified'), new Date())
    .addStringNoLocale(FHIR_NAMESPACE('author'), 'WellData App')
    .addStringNoLocale(FHIR_NAMESPACE('goal'), 'Stay healthy through WellData apps and share data responsibly to enable better health policy and research')
    .addStringNoLocale(FHIR_NAMESPACE('target'), 'http://snomed.info/sct/713404003')
    .addStringNoLocale(FHIR_NAMESPACE('frequency'), 'weekly')
    .addStringNoLocale(FHIR_NAMESPACE('action'), JSON.stringify([
      {
        title: 'Initial Action',
        description: 'This is the initial action',
        frequency: 'monthly'
      }
    ]))
    .build();

  // Add the plan thing to the dataset
  const updatedDataset = setThing(planDataset, planThing);

  // Save the dataset to the welldata Pod
  const planUrl = `${podUrl}data/plans/initial-plan.ttl`;
  await saveSolidDatasetAt(planUrl, updatedDataset, { fetch });
}
```

### Converting to FHIR JSON

The FHIR plan can be converted to JSON format using the `convertToFHIRJSON` function:

```typescript
export function convertToFHIRJSON(plan: FHIRPlan): any {
  const fhirPlan = {
    resourceType: 'PlanDefinition',
    id: plan.id,
    title: plan.title,
    description: plan.description,
    status: plan.status,
    date: plan.created.toISOString(),
    lastModified: plan.modified.toISOString(),
    author: [{
      display: plan.author
    }],
    goal: [{
      description: {
        text: plan.goal
      }
    }],
    action: plan.actions.map(action => ({
      title: action.title,
      description: action.description,
      timing: {
        repeat: {
          frequency: action.frequency === 'weekly' ? 1 : 0,
          period: action.frequency === 'weekly' ? 7 : 30,
          periodUnit: 'd'
        }
      }
    })),
    extension: [{
      url: 'http://hl7.org/fhir/StructureDefinition/PlanDefinition-target',
      valueCodeableConcept: {
        coding: [{
          system: plan.target.code.split('#')[0],
          code: plan.target.code.split('#')[1],
          display: 'Use of mobile health application'
        }]
      }
    }]
  };

  return fhirPlan;
}
```

## Error Handling

### WebID Extraction Errors

The WebID extraction logic includes error handling to ensure that the application can still function even if the WebID format is unexpected:

```typescript
try {
  const webIdUrl = new URL(session.info.webId);
  const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
  
  if (pathParts.length > 0) {
    podContainerUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
  } else {
    podContainerUrl = podUrl;
  }
} catch (error) {
  console.error('Error extracting Pod container URL:', error);
  podContainerUrl = podUrl;
}
```

### Container Creation Errors

The container creation process includes error handling to ensure that the application can recover from errors:

```typescript
try {
  await createContainerAt(welldataContainerUrl, { fetch });
} catch (error) {
  console.error('Error creating welldata container:', error);
  throw error;
}
```

### Resource Existence Checks

The `resourceExists` function is used to check if a resource exists before attempting to create it:

```typescript
export async function resourceExists(url: string): Promise<boolean> {
  try {
    await getSolidDataset(url, { fetch });
    return true;
  } catch (error) {
    return false;
  }
}
```

## Debugging Features

### Debug Mode

The application includes a debug mode that can be enabled to provide additional logging:

```typescript
const debugMode = localStorage.getItem('welldata_debug_mode') === 'true';
if (debugMode) {
  console.log('WebID:', session.info.webId);
  console.log('Extracted Pod URL:', podUrl);
}
```

### Debug Logging in podService

The `ensureWelldataStructure` function in the `podService` includes debug logging to help troubleshoot issues:

```typescript
if (debug) console.log('Starting welldata structure check...');
// ...
if (debug) console.log('Extracted Pod container URL:', podContainerUrl);
// ...
if (debug) console.log(`Checking welldata container at: ${welldataContainerUrl}`);
// ...
if (!welldataExists) {
  if (debug) console.log('Welldata container does not exist, creating it...');
  await createContainerAt(welldataContainerUrl, { fetch });
  if (debug) console.log('Welldata container created successfully');
} else {
  if (debug) console.log('Welldata container already exists');
}
```

### Debug Logging in ContainerManager

The `ContainerManager` component includes debug logging to help troubleshoot issues with container management:

```typescript
if (debugMode) {
  console.log('WebID:', session.info.webId);
  console.log('Extracted Pod URL:', podUrlFromWebId);
}
```

## Conclusion

The WellData application implements a robust system for extracting the Pod container URL from the user's WebID and creating the welldata container structure in the correct location. The implementation includes error handling and debugging features to ensure that the application can function correctly even in unexpected situations.

The key to ensuring that the welldata container is created inside the user's Pod container, rather than at the root level, is the correct extraction of the Pod container URL from the user's WebID. This is done by parsing the WebID using the `URL` constructor, extracting the first part of the path (usually the username/Pod name), and constructing the Pod container URL using the protocol, hostname, port (if any), and the first path part. 