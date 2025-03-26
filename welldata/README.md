# WellData - Your Personal Health Data Manager

A user-friendly application that helps you manage your preventive health data securely in your personal data pod. Built as part of the WellData ecosystem, this app enables you to organize your health information and share it with healthcare providers when needed.

## What You Can Do

### 1. Manage Your Health Data
- View and organize your health data in a structured way
- Access your health plans and goals
- Track your progress over time
- Keep all your health information in one secure place

### 2. Control Your Data
- Store your data securely in your personal data pod
- Choose who can access your health information
- Share data with healthcare providers when needed
- Export your data in standard formats

### 3. Connect with Health Apps
- Integrate with existing health applications:
  - [Selfcare](https://selfcare4me.com/)
  - [Zipster](https://www.zipster.care/)
  - [Bibopp](https://bibopp.be/)
- Avoid duplicate data entry across apps
- Keep your health data synchronized

### 4. Future Features
- View community health statistics
- Compare your progress with others
- Get personalized health recommendations
- Support health research (with your consent)

## Getting Started

1. Log in with your SOLID pod credentials
2. Your personal data pod will be automatically set up
3. Start organizing your health data
4. Connect with other health apps as needed

## Known Issues and Future Development

### Current Limitations
1. **Data Organization**
   - Limited support for complex health data structures
   - Basic file and container management
   - Future versions will include better data organization features

2. **App Integration**
   - Limited integration with external health apps
   - Basic data synchronization
   - Future versions will support more health apps

3. **User Interface**
   - Basic navigation and data viewing
   - Limited data visualization
   - Future versions will include better data presentation

### Planned Improvements
1. **Enhanced Data Management**
   - Better organization of health data
   - Improved data visualization
   - Advanced search and filtering

2. **App Integration**
   - More health app connections
   - Better data synchronization
   - Enhanced data sharing options

3. **User Experience**
   - Improved navigation
   - Better data presentation
   - Enhanced mobile support

## Technical Documentation

### Features
- User authentication with OpenID Connect via SOLID
- Automatic creation of welldata container structure
- FHIR-based data structure for health plans and goals
- Container and resource management
- Modern, responsive UI with Chakra UI

### Design Trade-offs

1. **Data Storage**:
   - FHIR-compliant data structures
   - Direct integration with Solid pod
   - Trade-off: Requires careful handling of data relationships

2. **User Interface**:
   - Chakra UI for consistent design
   - Responsive layout for all devices
   - Trade-off: Larger bundle size compared to custom CSS

3. **Container Structure**:
   - Organized data hierarchy
   - Clear separation of concerns
   - Trade-off: More complex navigation structure

## Development

To start the development server:

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5175

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
welldata/
├── src/
│   ├── components/         # React components
│   │   ├── common/        # Shared components
│   │   └── ...           # Feature-specific components
│   ├── services/          # Business logic and API calls
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application component
├── docs/                 # Documentation
│   ├── COMPONENTS.md     # Component documentation
│   └── TECHNICAL_DETAILS.md # Technical implementation details
└── public/               # Static assets
```

## Contributing

Please read our [Development Guidelines](docs/development.md) before contributing to the project.

## License

This project is part of the WellData ecosystem and follows its licensing terms. See the main project's [README](../README.md) for license details. 