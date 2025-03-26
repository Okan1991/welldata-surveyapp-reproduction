# WellData Health Survey App

A user-friendly health survey application that helps you track your health status and share it securely with healthcare providers. Built as part of the WellData ecosystem, this app allows you to complete health-related surveys and store your responses in your personal data pod.

## What You Can Do

### 1. Complete Health Surveys
- Fill out comprehensive health questionnaires
- Get immediate feedback on your responses
- Save your progress and continue later
- Review your previous responses

### 2. Multi-Language Support
- Switch between languages instantly
- Access surveys in your preferred language
- Maintain consistent terminology across languages

### 3. Accessibility Features
- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Clear, readable text
- Helpful tooltips and explanations

### 4. Data Control
- Store your responses securely in your personal data pod
- Control who can access your health data
- Share data with healthcare providers when needed
- Export your responses in standard formats

## Getting Started

1. Log in with your SOLID pod credentials
2. Select a health survey to complete
3. Answer questions at your own pace
4. Save your responses securely

## Known Issues and Future Development

### Current Limitations
1. **Incomplete Response Storage**
   - The app currently does not store all answer items in the questionnaire responses
   - This is visible in the WellData app's TTL view of responses
   - This will be fixed in a future update to ensure complete data storage

2. **Offline Support**
   - Limited offline functionality
   - Responses are only saved when online
   - Future versions will include offline storage and sync

3. **Data Export**
   - Limited export format options
   - Future versions will support more standard formats

### Planned Improvements
1. **Enhanced Data Storage**
   - Complete storage of all answer items
   - Better handling of complex question types
   - Improved data validation

2. **User Experience**
   - Progress saving improvements
   - Better error handling
   - Enhanced feedback system

3. **Integration**
   - Better integration with other WellData apps
   - Support for more FHIR resources
   - Enhanced data sharing capabilities

## Technical Documentation

### Features
- FHIR-compliant survey structure
- Multi-language support with immediate language switching
- Accessibility-first design with keyboard navigation
- Integration with Solid pod for data storage
- Chakra UI for modern, responsive design
- TypeScript for type safety
- SOLID authentication integration

### Design Trade-offs

1. **Language Switching**:
   - Immediate language updates without page refresh
   - Centralized translation management
   - Trade-off: Slightly increased memory usage due to maintaining multiple language versions

2. **Accessibility**:
   - Keyboard navigation support (Command/Ctrl + Arrow keys)
   - ARIA labels and roles for screen readers
   - Trade-off: Additional complexity in component structure

3. **Data Storage**:
   - FHIR-compliant survey responses
   - Direct integration with Solid pod
   - Trade-off: Requires careful handling of offline scenarios

4. **UI Framework**:
   - Chakra UI for consistent design
   - Responsive layout for all devices
   - Trade-off: Larger bundle size compared to custom CSS

## Development

To start the development server:

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5176

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
surveyapp/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components
│   │   │   └── Auth.tsx     # SOLID authentication component
│   │   └── survey/          # Survey-specific components
│   │       ├── questions/   # Question type components
│   │       └── ...         # Other survey components
│   ├── surveys/            # Survey definitions and types
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── health-survey.ts # Survey definition
│   │   └── translations/   # Language translations
│   ├── pages/             # Page components
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── docs/                  # Documentation
│   ├── README.md          # Survey structure documentation
│   ├── component-architecture.md
│   ├── accessibility.md
│   └── development.md
└── public/                # Static assets
```

## Contributing

Please read our [Development Guidelines](docs/development.md) before contributing to the project.

## License

This project is part of the WellData ecosystem and follows its licensing terms. See the main project's [README](../README.md) for license details. 