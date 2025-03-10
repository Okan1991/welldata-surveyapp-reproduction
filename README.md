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

## Project Structure

- `/` - Root directory containing the SOLID server configuration
- `/app` - SolidJS web application
  - `/src` - Source code
  - `/src/components` - React components
  - `/src/App.tsx` - Main application component
  - `/src/index.tsx` - Application entry point

## Setup

1. Install dependencies:
```bash
# Install server dependencies
npm install

# Install web app dependencies
cd app
npm install
```

2. Start the SOLID server:
```bash
npm start
```

3. Start the web application:
```bash
cd app
npm run dev
```

4. Open http://localhost:5173 in your browser

## Development

The project uses:
- Community Solid Server for the SOLID pod
- SolidJS for the web application
- Inrupt Solid Client libraries for SOLID interactions
- TypeScript for type safety
- Vite for development and building

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