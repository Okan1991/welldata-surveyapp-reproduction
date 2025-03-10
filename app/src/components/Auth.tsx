import { createSignal, Show, onMount } from 'solid-js';
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from '@inrupt/solid-client-authn-browser';

export default function Auth() {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [webId, setWebId] = createSignal('');
  const [error, setError] = createSignal('');

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
      }
    } catch (e) {
      setError(`Error handling redirect: ${e}`);
    }
  };

  // Handle login click
  const handleLogin = async () => {
    try {
      setError('');
      await login({
        oidcIssuer: 'http://localhost:3000',
        redirectUrl: window.location.href,
        clientName: 'Solid Test App'
      });
    } catch (e) {
      setError(`Error during login: ${e}`);
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
    } catch (e) {
      setError(`Error during logout: ${e}`);
    }
  };

  // Check for redirect on component mount
  onMount(() => {
    handleRedirect();
  });

  return (
    <div class="auth-container">
      <Show when={error()}>
        <p class="error">{error()}</p>
      </Show>
      
      <Show
        when={isLoggedIn()}
        fallback={
          <button onClick={handleLogin} class="login-button">
            Log in with Solid
          </button>
        }
      >
        <div class="profile">
          <p>Logged in as: {webId()}</p>
          <button onClick={handleLogout} class="logout-button">
            Log out
          </button>
        </div>
      </Show>
    </div>
  );
} 