import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Badge,
  Heading,
  Code,
  Divider
} from '@chakra-ui/react';
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  logout
} from '@inrupt/solid-client-authn-browser';

/**
 * Clears all Solid-related items from localStorage to force re-registration
 * with the Solid server after a server restart.
 */
const clearSolidStorage = () => {
  // Clear all Solid-related items from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('solid-') || key.includes('oidc'))) {
      localStorage.removeItem(key);
    }
  }
  // Reload the page
  window.location.reload();
};

interface AuthManagerProps {
  onLoginStatusChange: (isLoggedIn: boolean) => void;
}

const AuthManager = ({ onLoginStatusChange }: AuthManagerProps) => {
  const [oidcIssuer, setOidcIssuer] = useState('http://localhost:3000');
  const [webId, setWebId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Fixed client ID from registration
  const clientId = "GRuMfa81Kf2U4TGK40dx4";
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.200', 'purple.700');
  const troubleshootingBg = useColorModeValue('red.50', 'red.900');

  useEffect(() => {
    // Handle the redirect from the Solid identity provider
    handleIncomingRedirect({
      restorePreviousSession: true
    }).then((info) => {
      if (info?.webId) {
        setWebId(info.webId);
        setIsLoggedIn(true);
        onLoginStatusChange(true);
      } else {
        onLoginStatusChange(false);
      }
    }).catch((e) => {
      setError(`Authentication error: ${e.message}`);
      onLoginStatusChange(false);
    });
  }, [onLoginStatusChange]);

  const handleLogin = async () => {
    if (!oidcIssuer) {
      setError('Please enter an OIDC issuer URL');
      return;
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      await login({
        oidcIssuer,
        redirectUrl: window.location.href,
        clientName: 'Solid Pod Manager - Alternative UI',
        clientId: clientId
      });
    } catch (e) {
      setError(`Login failed: ${e instanceof Error ? e.message : String(e)}`);
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const session = getDefaultSession();
    await session.logout();
    setWebId(null);
    setIsLoggedIn(false);
    onLoginStatusChange(false);
  };

  return (
    <Box 
      p={5} 
      bg={bgColor} 
      borderRadius="lg" 
      boxShadow="md"
      borderRight="4px solid" 
      borderColor="brand.500"
    >
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <CloseButton 
            position="absolute" 
            right="8px" 
            top="8px" 
            onClick={() => setError(null)} 
          />
        </Alert>
      )}

      {webId ? (
        <VStack align="stretch" spacing={4}>
          <HStack>
            <Badge colorScheme="green" fontSize="md" px={2} py={1}>
              Logged In
            </Badge>
            <Text fontWeight="bold" flex="1">
              {webId}
            </Text>
          </HStack>
          <HStack spacing={4}>
            <Button 
              colorScheme="purple" 
              onClick={handleLogout}
              size="lg"
              variant="outline"
            >
              Log Out
            </Button>
            <Button colorScheme="red" variant="outline" onClick={clearSolidStorage}>
              Clear Auth Data
            </Button>
          </HStack>
        </VStack>
      ) : (
        <VStack align="stretch" spacing={4}>
          <Heading size="md">Login to your Solid Pod</Heading>
          <FormControl>
            <FormLabel fontWeight="bold">Solid Identity Provider</FormLabel>
            <InputGroup>
              <InputLeftAddon>URL</InputLeftAddon>
              <Input 
                value={oidcIssuer}
                onChange={(e) => setOidcIssuer(e.target.value)}
                placeholder="Enter your Solid identity provider URL"
              />
            </InputGroup>
          </FormControl>
          <Button 
            colorScheme="purple" 
            onClick={handleLogin}
            isLoading={isLoggingIn}
            loadingText="Logging in..."
            size="lg"
          >
            Log In
          </Button>
          <Text fontSize="sm">
            For local development, use: <Code>http://localhost:3000</Code>
          </Text>
          
          <Divider my={4} />
          
          <Box 
            bg={troubleshootingBg} 
            p={4} 
            borderRadius="md" 
            borderLeft="4px solid" 
            borderColor="red.500"
          >
            <Heading size="sm" color="red.600" mb={2}>
              Having trouble logging in?
            </Heading>
            <Text fontSize="sm" mb={3}>
              If you're seeing authentication errors after server restart, try clearing your auth data:
            </Text>
            <Button 
              colorScheme="red" 
              size="sm" 
              onClick={clearSolidStorage}
            >
              Clear Auth Data
            </Button>
          </Box>
        </VStack>
      )}
    </Box>
  );
};

export default AuthManager;
