# SOLID Local File Manager

A web application for managing files in a local SOLID pod with OpenID Connect support. Built with SolidJS and Community Solid Server.

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

MIT 