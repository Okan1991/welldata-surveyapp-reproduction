# WellData Health Survey App

A React-based health survey application within the WellData ecosystem. This application allows users to complete health-related surveys and store their responses in their Solid pod.

## Features

- FHIR-compliant survey structure
- Multi-language support
- Accessibility-first design
- Integration with Solid pod for data storage
- Chakra UI for modern, responsive design
- TypeScript for type safety

## Documentation

- [Survey Structure](docs/README.md) - Detailed documentation of the survey structure and FHIR compliance
- [Component Architecture](docs/component-architecture.md) - Overview of the component structure and design patterns
- [Accessibility Guidelines](docs/accessibility.md) - Accessibility features and best practices
- [Development Guidelines](docs/development.md) - Development setup and coding standards

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
│   │   └── survey/           # Survey-specific components
│   │       ├── questions/    # Question type components
│   │       └── ...          # Other survey components
│   ├── surveys/             # Survey definitions and types
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── health-survey.ts # Survey definition
│   │   └── translations/    # Language translations
│   ├── pages/              # Page components
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── docs/                   # Documentation
│   ├── README.md           # Survey structure documentation
│   ├── component-architecture.md
│   ├── accessibility.md
│   └── development.md
└── public/                 # Static assets
```

## Contributing

Please read our [Development Guidelines](docs/development.md) before contributing to the project.

## License

This project is part of the WellData ecosystem and follows its licensing terms. 