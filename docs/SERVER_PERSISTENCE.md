# Server Persistence in Community Solid Server

This document explains how the Community Solid Server (CSS) handles data persistence and where different types of data are stored.

## Overview

By default, the Community Solid Server stores all data in the root directory of the project. This includes:

- Pod data (user content)
- User accounts
- Client registrations
- Session information
- OIDC configuration

When the server restarts or crashes, this data persists, allowing users to continue working with their accounts and data.

> ⚠️ **Important Note on Implementation**: 
> 
> The file persistence described in this document is realized through the basic file storage settings provided by the default configuration (`css:config/file.json`). Our attempts to implement custom configurations via the `configs` directory were unsuccessful due to JSON-LD parsing issues in the CSS. The Community Solid Server consistently reports errors related to invalid predicate IRIs when attempting to use custom configuration files.
>
> For now, we rely on the default file-based persistence mechanism built into CSS, which works reliably but stores data in the project root rather than in a dedicated `.data` directory as we would prefer.

## Data Storage Structure

The CSS creates the following directory structure in the project root:

```
/
├── .internal/            # Internal server data
│   ├── accounts/         # User account information
│   ├── idp/              # Identity provider data
│   │   └── adapter/      
│   │       ├── Client/   # Client registration information
│   │       └── ...       # Other OIDC-related data
│   └── ...
├── [pod-name-1]/         # Pod directories (one per user)
├── [pod-name-2]/
└── ...
```

### Key Directories and Their Contents

#### `.internal/`

This hidden directory contains all server-specific data:

- **`accounts/`**: Stores user account information, including usernames, email addresses, and password hashes.
- **`idp/adapter/Client/`**: Contains client registration information for applications that connect to the server.
- **`idp/adapter/Session/`**: Stores session data for authenticated users.

#### Pod Directories

Each user's Pod is stored in a separate directory at the root level, named after the Pod identifier. These directories contain:

- User-created containers and resources
- Access control lists (ACLs)
- Metadata about the resources

## Implications for Development

### Data Persistence Between Restarts

When you restart the server, all data (Pods, accounts, client registrations) remains intact. This is beneficial for development as you don't need to recreate accounts and data after each restart.

### Client Registration

The client registration script (`scripts/register-fixed-clients.sh`) registers clients with the server, and the server stores this information in `.internal/idp/adapter/Client/`. This means:

1. Client IDs and secrets persist between server restarts
2. Applications can maintain their authentication state

### Clearing Data

If you need to reset the server to a clean state, you would need to:

1. Stop the server
2. Remove the Pod directories and `.internal` directory
3. Restart the server

## Future Improvements

In a future update, we plan to modify the configuration to store all server data in a dedicated `.data` directory instead of the project root. This will:

- Keep the project directory cleaner
- Make it easier to back up or migrate server data
- Provide a more organized structure for different types of persistent data

### Challenges with Custom Configuration

Our attempts to implement a custom configuration for storing data in the `.data` directory have encountered several challenges:

1. **JSON-LD Parsing Issues**: The Community Solid Server uses JSON-LD for configuration, which requires specific formatting for predicates and objects. Our attempts to create custom configurations resulted in errors like "Invalid predicate IRI" for properties such as `path`, `storage`, and `args_rootFilePath`.

2. **Component Conflicts**: When attempting to override specific components, we encountered conflicts with the default configuration, resulting in errors about multiple values for parameters.

### Potential Solutions

Several approaches could be explored in the future:

1. **Environment Variables**: The CSS supports some configuration via environment variables, which might provide a way to specify storage locations without modifying the JSON-LD configuration.

2. **Custom Build**: Creating a custom build of the CSS with modified default configurations could bypass the need for runtime configuration changes.

3. **Symbolic Links**: Using symbolic links to redirect the default storage locations to the `.data` directory could achieve the desired organization without requiring configuration changes.

4. **Upstream Improvements**: Contributing improvements to the CSS project to make custom configurations more accessible and better documented.

## Troubleshooting

If you encounter issues with client authentication or user accounts after a server restart:

1. Check that the `.internal` directory exists and contains data
2. Verify that client registrations are present in `.internal/idp/adapter/Client/`
3. Ensure the Pod directories have the correct permissions

If data appears to be missing or corrupted, you may need to re-register clients using the registration script and recreate user accounts. 