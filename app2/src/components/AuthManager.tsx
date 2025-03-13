import React, { useState, useEffect } from 'react';
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
  Divider,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Stack,
  useToast
} from '@chakra-ui/react';
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  Session
} from '@inrupt/solid-client-authn-browser';
import clientCredentials from '../../../shared/client-credentials.json';
// Use dynamic credentials for app2
import clientCredentialsDynamic from '../../../.data/client-credentials/app2-credentials.json';


// Use dynamic credentials for app2 - these are the ones registered with the server
const clientId = clientCredentialsDynamic.client_id;
const clientSecret = clientCredentialsDynamic.client_secret;

// For debugging
console.log('Using client ID:', clientId);
console.log('Using redirect URI:', clientCredentialsDynamic.redirect_uris[0]);


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
  onLogin: (webId: string) => void;
  onLogout: () => void;
}

const AuthManager: React.FC<AuthManagerProps> = ({ onLogin, onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [webId, setWebId] = useState('');
  const [issuer, setIssuer] = useState('http://localhost:3000');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        await handleIncomingRedirect({ restorePreviousSession: true });
        const session = getDefaultSession();
        if (session.info.isLoggedIn) {
          setIsLoggedIn(true);
          setWebId(session.info.webId || '');
          if (typeof onLogin === 'function') {
            onLogin(session.info.webId || '');
          }
        }
      } catch (error) {
        console.error('Error during session restoration:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to restore session. Please try logging in again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [onLogin, toast]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Use the exact redirect URI from the dynamic credentials
      await login({
        oidcIssuer: issuer,
        redirectUrl: clientCredentialsDynamic.redirect_uris[0],
        clientId: clientId,
        clientSecret: clientSecret
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Could not log in. Please check your identity provider and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const session = getDefaultSession();
      await session.logout();
      setIsLoggedIn(false);
      setWebId('');
      if (typeof onLogout === 'function') {
        onLogout();
      }
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'Could not log out. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: 'Storage Cleared',
      description: 'Local storage has been cleared. Please refresh the page.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Card width="100%" maxW="md" mx="auto">
      <CardHeader>
        <Heading size="md">Solid Authentication</Heading>
        <Text fontSize="sm" color="gray.500">
          {isLoggedIn ? 'You are logged in' : 'Log in to your Solid Pod'}
        </Text>
      </CardHeader>
      <CardBody>
        {!isLoggedIn ? (
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Solid Identity Provider</FormLabel>
              <Input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Enter your Solid Identity Provider"
              />
            </FormControl>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Text fontWeight="medium" fontSize="sm">WebID:</Text>
            <Text fontSize="sm" wordBreak="break-all">{webId}</Text>
          </Stack>
        )}
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {!isLoggedIn ? (
          <Button
            colorScheme="blue"
            width="100%"
            onClick={handleLogin}
            isLoading={loading}
            loadingText="Logging in..."
          >
            Log In
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            width="100%"
            onClick={handleLogout}
            isLoading={loading}
            loadingText="Logging out..."
          >
            Log Out
          </Button>
        )}
        <Button
          colorScheme="red"
          width="100%"
          onClick={clearLocalStorage}
        >
          Clear Auth Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthManager;
