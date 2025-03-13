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
  const [showDropdown, setShowDropdown] = createSignal(false);

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
      setShowDropdown(false);
    } catch (e) {
      setError(`Error during logout: ${e}`);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown());
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.profile-dropdown') === null && showDropdown()) {
      setShowDropdown(false);
    }
  };

  // Check for redirect on component mount
  onMount(() => {
    handleRedirect();
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  return (
    <div class="auth-container" style="position: relative;">
      <Show when={error()}>
        <p class="error" style="color: #d32f2f; background: #ffebee; padding: 8px; border-radius: 4px; margin-bottom: 16px;">{error()}</p>
      </Show>
      
      <Show
        when={isLoggedIn()}
        fallback={
          <button 
            onClick={handleLogin} 
            class="login-button"
            style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;"
          >
            Log in with Solid
          </button>
        }
      >
        <div class="profile-dropdown" style="position: relative;">
          <button 
            onClick={toggleDropdown} 
            class="profile-button"
            style="background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #f0f0f0;"
            title="User Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          
          <Show when={showDropdown()}>
            <div 
              class="dropdown-menu"
              style="position: absolute; top: 45px; right: 0; background: white; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 12px; min-width: 200px; z-index: 100;"
            >
              <div style="margin-bottom: 12px;">
                <div style="font-weight: bold; margin-bottom: 4px;">WebID:</div>
                <div style="word-break: break-all; font-size: 0.9em; color: #666;">{webId()}</div>
              </div>
              <button 
                onClick={handleLogout} 
                class="logout-button"
                style="background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%;"
              >
                Log out
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
} 