import React, { useEffect, useState } from 'react';
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from '@inrupt/solid-client-authn-browser';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Box,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [webId, setWebId] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  // Handle the redirect after login
  const handleRedirect = async () => {
    try {
      await handleIncomingRedirect({
        restorePreviousSession: true,
      });
      
      const session = getDefaultSession();
      if (session.info.isLoggedIn) {
        setIsLoggedIn(true);
        setWebId(session.info.webId || '');
        // Redirect to survey after successful login
        navigate('/test');
      }
    } catch (e) {
      setError(`Error handling redirect: ${e}`);
      toast({
        title: 'Authentication Error',
        description: 'Failed to handle login redirect',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle login click
  const handleLogin = async () => {
    try {
      setError('');
      await login({
        oidcIssuer: 'http://localhost:3000',
        redirectUrl: window.location.href,
        clientName: 'Survey App'
      });
    } catch (e) {
      setError(`Error during login: ${e}`);
      toast({
        title: 'Login Error',
        description: 'Failed to initiate login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle logout click
  const handleLogout = async () => {
    try {
      const session = getDefaultSession();
      await session.logout();
      setIsLoggedIn(false);
      setWebId('');
      setError('');
      navigate('/');
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      setError(`Error during logout: ${e}`);
      toast({
        title: 'Logout Error',
        description: 'Failed to log out',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Check for redirect on component mount
  useEffect(() => {
    handleRedirect();
  }, []);

  return (
    <Box>
      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}
      
      {isLoggedIn ? (
        <Menu>
          <MenuButton
            as={Button}
            rounded="full"
            variant="link"
            cursor="pointer"
            minW={0}
          >
            <Avatar
              size="sm"
              name={webId}
              bg="blue.500"
            />
          </MenuButton>
          <MenuList>
            <MenuItem>
              <Text fontSize="sm" noOfLines={1}>
                {webId}
              </Text>
            </MenuItem>
            <MenuItem onClick={handleLogout} color="red.500">
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Button
          onClick={handleLogin}
          colorScheme="blue"
          size="md"
        >
          Log in with SOLID
        </Button>
      )}
    </Box>
  );
};

export default Auth; 