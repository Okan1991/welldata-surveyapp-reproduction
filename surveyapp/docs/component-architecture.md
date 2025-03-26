# Component Architecture

This document outlines the component architecture of the WellData Health Survey App.

## Overview

The application follows a component-based architecture with a clear separation of concerns:

1. **Container Components**: Manage state and orchestrate child components
2. **Presentation Components**: Handle rendering and user interaction
3. **Question Type Components**: Implement specific question input types

## Component Hierarchy

```
SurveyContainer
├── SurveyProgress
├── SurveyQuestion
│   ├── BooleanQuestion
│   ├── ChoiceQuestion
│   ├── TextQuestion
│   ├── NumberQuestion
│   └── SnomedQuestion
└── SurveyNavigation
```

## Component Responsibilities

### SurveyContainer
- Main container component
- Manages survey state
- Handles question navigation
- Coordinates between components
- Manages answer collection

### SurveyProgress
- Displays survey completion progress
- Shows current question number
- Visual progress indicator
- Accessibility progress bar

### SurveyQuestion
- Question wrapper component
- Handles question rendering
- Manages error states
- Coordinates with question type components
- Provides accessibility context

### Question Type Components
Each question type component is responsible for:
- Rendering appropriate input type
- Handling user input
- Validating input
- Providing accessibility support
- Managing focus

### SurveyNavigation
- Handles question navigation
- Manages previous/next actions
- Controls survey completion
- Provides keyboard navigation

## State Management

The application uses React's built-in state management:
- `useState` for local component state
- Props for component communication
- Context for shared state (if needed)

## Accessibility Features

All components implement:
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Error handling

## Best Practices

1. **Component Design**
   - Single responsibility principle
   - Props interface definition
   - Type safety with TypeScript
   - Consistent naming conventions

2. **State Management**
   - Minimal state in components
   - Clear data flow
   - Predictable updates
   - Error boundary implementation

3. **Performance**
   - Memoization where needed
   - Efficient re-renders
   - Lazy loading of components
   - Optimized event handlers

4. **Testing**
   - Unit tests for components
   - Integration tests for flows
   - Accessibility testing
   - Performance testing 