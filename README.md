# SOLID Local File Manager

A web application for managing files in a local SOLID pod with OpenID Connect support. Built with SolidJS and Community Solid Server.

## Author

**Pieter Van Gorp**
- GitHub: [@pvgorp](https://github.com/pvgorp)

## Features

- User authentication with OpenID Connect
- Container management (create, list, delete)
- File management within containers (create, list, delete)
- RDF-based file metadata using Dublin Core Terms vocabulary
- Modern, responsive UI

## Documentation

### Project Documentation
- [README.md](README.md) - This file, containing setup and usage instructions
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solutions for common issues

### Application-Specific Documentation

#### SolidJS File Manager (app)
- [app/README.md](app/README.md) - Setup and usage instructions for the SolidJS application
- [app/docs/COMPONENTS.md](app/docs/COMPONENTS.md) - Overview of key components and their interactions
- [app/docs/TECHNICAL_DETAILS.md](app/docs/TECHNICAL_DETAILS.md) - Detailed technical implementation

#### React Chakra UI Pod Manager (app2)
- [app2/README.md](app2/README.md) - Setup and usage instructions for the React Chakra UI application
- [app2/docs/COMPONENTS.md](app2/docs/COMPONENTS.md) - Overview of key components and their interactions
- [app2/docs/TECHNICAL_DETAILS.md](app2/docs/TECHNICAL_DETAILS.md) - Detailed technical implementation

#### WellData Health Application (welldata)
- [welldata/README.md](welldata/README.md) - Setup and usage instructions for the WellData application
- [welldata/docs/COMPONENTS.md](welldata/docs/COMPONENTS.md) - Overview of key components and their interactions
- [welldata/docs/TECHNICAL_DETAILS.md](welldata/docs/TECHNICAL_DETAILS.md) - Detailed technical implementation

## Project Structure

- `/` - Root directory containing the SOLID server configuration
- `/app` - SolidJS application for managing files in a SOLID pod
- `/app2` - Alternative React application with Chakra UI
- `/welldata` - WellData application for managing health data in a SOLID pod
- `/scripts` - Utility scripts for managing client registrations and authentication

## Setup

1. Install dependencies:
```bash
# Install server dependencies
npm install

# Install first web app dependencies
cd app
npm install
cd ..

# Install second web app dependencies
cd app2
npm install
cd ..

# Install welldata app dependencies
cd welldata
npm install
cd ..
```

2. Start all components (server and all apps):
```bash
npm run dev
```

Alternatively, you can start components individually:

```bash
# Start the SOLID server
npm run start:server

# Start the first web application
npm run dev:app1

# Start the second web application
npm run dev:app2

# Start the welldata application
npm run dev:welldata
```

3. Access the applications:
   - First app: http://localhost:5173
   - Second app: http://localhost:5174
   - WellData app: http://localhost:5175

## Demo Applications Overview

This project showcases three different applications that can interact with the same Solid Pod, demonstrating the interoperability of Solid applications:

### 1. SolidJS File Manager (app)
A file manager built with SolidJS that provides basic file and container management functionality. This application demonstrates:
- Using SolidJS with Solid Client libraries
- Basic file operations (create, read, delete)
- Container management
- Simple, functional UI

### 2. React Chakra UI Pod Manager (app2)
An alternative UI built with React and Chakra UI that provides a more modern interface for managing Solid Pods. This application demonstrates:
- Using React with Chakra UI for a modern interface
- The same functionality as the first app but with a different UI
- How multiple applications can access the same Pod

### 3. WellData Health Application (welldata)
A specialized application for managing health data in a Solid Pod. This application demonstrates:
- Creating specialized containers for health data
- Implementing FHIR data structures in a Solid Pod
- Creating WebIDs for containers
- More advanced Solid features

## Testing Multiple Applications with the Same Pod

This project demonstrates how multiple applications can authenticate and access the same Solid Pod, which is a key feature of the Solid ecosystem. All three applications use the same local WebID and Pod, but have completely different user interfaces and functionality.

To test this functionality:

1. Start all applications and the Solid server
2. Create a test account and Pod on the local Solid server
3. Log in to all applications using the same WebID
4. Make changes in one application (e.g., create a container)
5. Observe that the changes are visible in the other applications

This demonstrates the interoperability of Solid applications and how users can control their data while using multiple applications.

## Handling Authentication After Server Restarts

When the Solid server restarts, client registrations are typically lost, which can cause authentication errors. This project includes several solutions to address this issue:

### 1. Persistent Client IDs with Scripts

The `/scripts` directory contains utilities to register client applications with the Solid server with fixed client IDs:

```bash
# One-step setup (starts servers and registers clients)
./scripts/setup-solid-env.sh

# Or run the steps individually:
# 1. Start the Solid server
npm run start:server

# 2. Register client applications with fixed IDs
./scripts/register-fixed-clients.sh

# 3. Start the applications
cd app && npm run dev
cd app2 && npm run dev
cd welldata && npm run dev
```

Alternatively, you can use the all-in-one script to start all servers with proper configuration:

```bash
./scripts/start-all-servers.sh
```

See the [scripts README](./scripts/README.md) for more details.

### 2. Clear Auth Data Button

All applications include a "Clear Auth Data" button that appears when you're logged in. This button:

- Clears all Solid-related authentication data from your browser's local storage
- Reloads the page so you can log in again with fresh credentials

Use this button when:
- You see authentication errors after restarting the server
- You want to switch to a different Solid identity provider
- You're experiencing other authentication issues

This provides a simple way to recover from authentication issues without having to manually clear local storage through browser developer tools.

### 3. Bookmarklet for Quick Clearing

For convenience, you can create a bookmarklet to clear Solid-related storage with a single click. See the [scripts README](./scripts/README.md) for instructions on setting up this bookmarklet.

## Local Development with Community Solid Server

### Setting Up Your Local WebID and Pod

For development purposes, it's recommended to use a locally generated WebID rather than an external one. This approach avoids CORS issues and simplifies the development process.

1. **Start the Community Solid Server**:
   ```bash
   npm start
   ```
   The server will run at http://localhost:3000

2. **Create a Test Account**:
   - Navigate to http://localhost:3000/.account/login/password/register/ in your browser
   - Register a new account with a username and password
   - After registration, you'll be logged in to your account dashboard

3. **Create a Pod**:
   - In your account dashboard, go to the "Pods" section
   - Click "Create Pod" and give it a name (e.g., "testpod")
   - The server will create a new Pod at http://localhost:3000/[pod-name]/

4. **WebID Generation**:
   - A WebID is automatically generated when you create a Pod
   - Your WebID will be available at http://localhost:3000/[pod-name]/profile/card#me
   - This WebID is fully configured and ready to use with your application

5. **Using Your Local WebID**:
   - When authenticating in your application, use http://localhost:3000 as the identity provider
   - Log in with your test account credentials
   - Your application will now be authenticated with your local WebID and can interact with your Pod

### Benefits of Using a Local WebID

- No CORS issues since everything is served from localhost
- Complete control over your WebID and Pod for testing
- Simplified authentication flow
- Full functionality without additional configuration

## Development

The project uses:
- Community Solid Server for the SOLID pod
- SolidJS and React for the web applications
- Inrupt Solid Client libraries for SOLID interactions
- TypeScript for type safety
- Vite for development and building

## Known Issues and Troubleshooting

This project has a few known issues:

1. **File Updates in Welldata Container**: There's a known issue with updating files in the welldata container, particularly the initial-plan.ttl file, which may result in 412 Precondition Failed errors.

2. **Client Credentials Issues**: The SOLID server sometimes reverts to using old client credentials, causing "accountID mismatch" errors during login attempts.

For detailed information about these issues and their workarounds, please refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md).

## License

Copyright 2024 Pieter Van Gorp

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 