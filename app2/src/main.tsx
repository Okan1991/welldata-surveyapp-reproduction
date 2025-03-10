import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';

// Define a custom theme with purple colors (different from the first app)
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5e9ff',
      100: '#dac1f0',
      200: '#c098e1',
      300: '#a571d2',
      400: '#8b49c3',
      500: '#7230aa',
      600: '#592585',
      700: '#401a60',
      800: '#270f3c',
      900: '#10031a',
    },
    purple: {
      50: '#f5e9ff',
      100: '#dac1f0',
      200: '#c098e1',
      300: '#a571d2',
      400: '#8b49c3',
      500: '#7230aa',
      600: '#592585',
      700: '#401a60',
      800: '#270f3c',
      900: '#10031a',
    }
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
); 