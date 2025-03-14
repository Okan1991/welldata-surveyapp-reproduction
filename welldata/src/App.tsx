import React, { useState, useEffect } from 'react';
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
  HStack,
  Link
} from '@chakra-ui/react';
import { HamburgerIcon, SettingsIcon } from '@chakra-ui/icons';
import AuthManager from './components/AuthManager';
import PodManager from './components/PodManager';
import Settings from './components/Settings';

// Logo paths
const wellDataLogoPath = '/images/WellData.png';
const interRegLogoPath = '/images/InterRegVLNL.png';

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
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [userInitiatedAction, setUserInitiatedAction] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Function to navigate to the landing page
  const goToHome = () => {
    setShowSettings(false);
    setShowLandingPage(true);
    setUserInitiatedAction(true);
    console.log("Going to home page, showLandingPage set to:", true);
  };

  // Function to navigate to the pod manager
  const goToPodManager = () => {
    setShowLandingPage(false);
    setShowSettings(false);
    setUserInitiatedAction(true);
  };

  // This effect will prevent automatic redirects from the landing page
  // unless the user has explicitly initiated an action
  useEffect(() => {
    // Reset the user initiated action flag after it's been processed
    return () => {
      if (userInitiatedAction) {
        setUserInitiatedAction(false);
      }
    };
  }, [showLandingPage, showSettings, userInitiatedAction]);

  return (
    <ChakraProvider theme={theme}>
      <Box bg={bgColor} color={textColor} minH="100vh" display="flex" flexDirection="column">
        {/* Header with WellData logo */}
        <Flex 
          as="header" 
          bg="eu.blue" 
          color="white" 
          p={3} 
          alignItems="center" 
          boxShadow="md"
        >
          {/* WellData Logo - Clickable to go to home */}
          <Link onClick={goToHome}>
            <Box 
              bg="white" 
              p={2} 
              borderRadius="md" 
              boxShadow="sm"
              transition="transform 0.2s"
              _hover={{ transform: 'scale(1.05)' }}
            >
              <Image 
                src={wellDataLogoPath} 
                alt="WellData Logo" 
                height="36px"
                cursor="pointer"
              />
            </Box>
          </Link>
          
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
                  onLogin={(webId) => {
                    setIsLoggedIn(true);
                    // Only redirect to pod manager if no user-initiated action has occurred
                    if (!userInitiatedAction) {
                      setShowLandingPage(false);
                    }
                  }} 
                  onLogout={() => {
                    setIsLoggedIn(false);
                    // When user logs out, show the landing page
                    setShowLandingPage(true);
                  }} 
                />
                {isLoggedIn && (
                  <Box mt={4} textAlign="center">
                    <VStack spacing={2}>
                      <Text 
                        as="button" 
                        color="eu.blue" 
                        fontWeight="bold"
                        onClick={() => {
                          setShowSettings(true);
                          setShowLandingPage(false);
                          setUserInitiatedAction(true);
                          onClose();
                        }}
                      >
                        Open Settings
                      </Text>
                      <Text 
                        as="button" 
                        color="eu.blue" 
                        fontWeight="bold"
                        onClick={() => {
                          goToPodManager();
                          onClose();
                        }}
                      >
                        Manage Pods
                      </Text>
                      <Text 
                        as="button" 
                        color="eu.blue" 
                        fontWeight="bold"
                        onClick={() => {
                          goToHome();
                          onClose();
                        }}
                      >
                        Home Page
                      </Text>
                    </VStack>
                  </Box>
                )}
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>

        {/* Main Content */}
        <Container maxW="container.lg" py={6} flex="1">
          {showSettings && isLoggedIn ? (
            <Settings />
          ) : showLandingPage ? (
            // Landing page - shown when showLandingPage is true, regardless of login status
            <Box textAlign="center" mt={10}>
              <Heading as="h2" size="lg" mb={4}>
                Welcome to WellData
              </Heading>
              <Text fontSize="md" mb={6}>
                Hello World! This is the WellData application for managing well data in Solid Pods.
              </Text>
              <Text fontSize="md" mb={6}>
                {isLoggedIn 
                  ? "Click 'Manage Pods' in the settings menu to start working with your data."
                  : "Please log in using the settings icon in the top right corner to access your data."
                }
              </Text>
              <Flex justifyContent="center" mt={8}>
                <Image 
                  src={wellDataLogoPath} 
                  alt="WellData Logo" 
                  height="100px"
                />
              </Flex>
            </Box>
          ) : (
            // Pod Manager - shown when showLandingPage is false and user is logged in
            isLoggedIn && <PodManager />
          )}
        </Container>
        
        {/* Footer with blue divider and white background */}
        <Box>
          {/* Blue divider */}
          <Box bg="eu.blue" h="4px" />
          
          {/* White footer content */}
          <Box as="footer" bg="white" color="gray.700" p={4}>
            <Container maxW="container.lg">
              <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
                <Text fontSize="sm">© {new Date().getFullYear()} WellData Project</Text>
                
                <Flex align="center" mt={{ base: 4, md: 0 }}>
                  <Image 
                    src={interRegLogoPath} 
                    alt="InterReg Vlaanderen-Nederland Logo" 
                    height="50px"
                  />
                </Flex>
              </Flex>
            </Container>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App; 