import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  Flex,
  Spacer,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  useDisclosure,
  Image,
  extendTheme,
  HStack
} from '@chakra-ui/react';
import { HamburgerIcon, SettingsIcon } from '@chakra-ui/icons';
import AuthManager from './components/AuthManager';
import PodManager from './components/PodManager';
import Settings from './components/Settings';

// EU theme colors
const theme = extendTheme({
  colors: {
    eu: {
      blue: '#003399', // EU Blue
      yellow: '#FFCC00', // EU Yellow
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#003399', // Primary EU Blue
      600: '#002B80',
      700: '#002266',
      800: '#001A4D',
      900: '#001133',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'eu',
      },
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <ChakraProvider theme={theme}>
      <Box bg={bgColor} color={textColor} minH="100vh">
        {/* Header with EU branding */}
        <Flex 
          as="header" 
          bg="eu.blue" 
          color="white" 
          p={3} 
          alignItems="center" 
          boxShadow="md"
        >
          <HStack spacing={3}>
            <Image 
              src="https://european-union.europa.eu/themes/contrib/oe_theme/dist/eu/images/logo/standard-version/positive/logo-eu--en.svg" 
              alt="EU Logo" 
              height="30px"
              display={{ base: 'none', md: 'block' }}
            />
            <Heading as="h1" size="md">WellData</Heading>
          </HStack>
          <Spacer />
          <Popover isOpen={isOpen} onClose={onClose} placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                aria-label="User settings"
                icon={<SettingsIcon />}
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={onOpen}
              />
            </PopoverTrigger>
            <PopoverContent width="300px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody p={4}>
                <AuthManager 
                  onLogin={(webId) => setIsLoggedIn(true)} 
                  onLogout={() => setIsLoggedIn(false)} 
                />
                {isLoggedIn && (
                  <Box mt={4} textAlign="center">
                    <Text 
                      as="button" 
                      color="eu.blue" 
                      fontWeight="bold"
                      onClick={() => {
                        setShowSettings(true);
                        onClose();
                      }}
                    >
                      Open Settings
                    </Text>
                  </Box>
                )}
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>

        {/* Main Content */}
        <Container maxW="container.lg" py={6}>
          {showSettings && isLoggedIn ? (
            <Settings />
          ) : (
            <>
              {isLoggedIn && <PodManager />}
              {!isLoggedIn && (
                <Box textAlign="center" mt={10}>
                  <Heading as="h2" size="lg" mb={4}>
                    Welcome to WellData
                  </Heading>
                  <Text fontSize="md" mb={6}>
                    Hello World! This is the WellData application for managing well data in Solid Pods.
                  </Text>
                  <Text fontSize="md" mb={6}>
                    Please log in using the settings icon in the top right corner to access your data.
                  </Text>
                  <Flex justifyContent="center" mt={8}>
                    <Image 
                      src="https://european-union.europa.eu/themes/contrib/oe_theme/dist/eu/images/logo/standard-version/positive/logo-eu--en.svg" 
                      alt="EU Logo" 
                      height="60px"
                    />
                  </Flex>
                  <Text fontSize="sm" color="gray.500" mt={4}>
                    Funded by the European Union
                  </Text>
                </Box>
              )}
            </>
          )}
        </Container>
        
        {/* Footer with EU branding */}
        <Box as="footer" bg="eu.blue" color="white" p={4} mt="auto">
          <Container maxW="container.lg">
            <Flex direction={{ base: 'column', md: 'row' }} align="center">
              <Text fontSize="sm">© {new Date().getFullYear()} WellData Project</Text>
              <Spacer />
              <Text fontSize="sm">Funded by the European Union</Text>
            </Flex>
          </Container>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App; 