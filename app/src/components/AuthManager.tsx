import { createSignal, onMount } from 'solid-js';
import { login, handleIncomingRedirect, getDefaultSession, logout } from '@inrupt/solid-client-authn-browser';
import styles from './AuthManager.module.css';

/**
 * Clears all Solid-related items from localStorage to force re-registration
 * with the Solid server after a server restart.
 */
function clearSolidStorage() {
  // Clear all Solid-related items from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('solid-') || key.includes('oidc'))) {
      localStorage.removeItem(key);
    }
  }
  // Reload the page
  window.location.reload();
}

interface AuthManagerProps {
  onLoginStatusChange: (isLoggedIn: boolean) => void;
}

const AuthManager = (props: AuthManagerProps) => {
  const [oidcIssuer, setOidcIssuer] = createSignal('http://localhost:3000');
  const [webId, setWebId] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);

  onMount(async () => {
    try {
      await handleIncomingRedirect({ restorePreviousSession: true });
      const session = getDefaultSession();
      if (session.info.isLoggedIn) {
        setIsLoggedIn(true);
        setWebId(session.info.webId || '');
        props.onLoginStatusChange(true);
      }
    } catch (e) {
      console.error('Error handling redirect:', e);
      setError('Error during authentication. Please try again.');
    }
  });

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login({
        oidcIssuer: oidcIssuer(),
        redirectUrl: window.location.href,
        clientName: 'Solid File Manager'
      });
    } catch (e) {
      console.error('Login error:', e);
      setError('Login failed. Please check your OIDC issuer and try again.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setWebId('');
      props.onLoginStatusChange(false);
    } catch (e) {
      console.error('Logout error:', e);
      setError('Logout failed. Please try again.');
    }
  };

  return (
    <div class={styles.authContainer}>
      {isLoggedIn() ? (
        <div class={styles.loggedInContainer}>
          <p>Logged in as: <span class={styles.webId}>{webId()}</span></p>
          <div class={styles.buttonContainer}>
            <button class={styles.logoutButton} onClick={handleLogout}>Logout</button>
            <button class={styles.clearButton} onClick={clearSolidStorage}>
              Clear Auth Data
            </button>
          </div>
        </div>
      ) : (
        <div class={styles.loginContainer}>
          <h2>Login to your Solid Pod</h2>
          {error() && <p class={styles.error}>{error()}</p>}
          <input
            type="text"
            value={oidcIssuer()}
            onInput={(e) => setOidcIssuer(e.currentTarget.value)}
            placeholder="Enter your OIDC Issuer"
            class={styles.input}
          />
          <button class={styles.loginButton} onClick={handleLogin} disabled={loading()}>
            {loading() ? 'Logging in...' : 'Login'}
          </button>
          <p class={styles.hint}>
            For local development, use: <code>http://localhost:3000</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthManager; 