import { createSignal, onMount, Show } from 'solid-js';
import { login, handleIncomingRedirect, getDefaultSession } from '@inrupt/solid-client-authn-browser';
import styles from '../App.module.css';
import fs from 'fs';
import path from 'path';

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
  onLogin: (webId: string) => void;
  onLogout: () => void;
}

export default function AuthManager(props: AuthManagerProps) {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [webId, setWebId] = createSignal('');
  const [issuer, setIssuer] = createSignal('http://localhost:3000');
  const [loading, setLoading] = createSignal(false);

  // Load client credentials from shared/client-credentials.json
  const credentialsPath = path.join(__dirname, '../../shared/client-credentials.json');
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  const clientId = credentials.app1.client_id;
  const clientSecret = credentials.app1.client_secret;

  onMount(async () => {
    setLoading(true);
    try {
      await handleIncomingRedirect({ restorePreviousSession: true });
      const session = getDefaultSession();
      if (session.info.isLoggedIn) {
        setIsLoggedIn(true);
        setWebId(session.info.webId || '');
        props.onLogin(session.info.webId || '');
      }
    } catch (error) {
      console.error('Error during session restoration:', error);
    } finally {
      setLoading(false);
    }
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login({
        oidcIssuer: issuer(),
        redirectUrl: window.location.href,
        clientId: clientId,
        clientSecret: clientSecret
      });
    } catch (error) {
      console.error('Login error:', error);
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
      props.onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Local storage cleared. Please refresh the page.');
  };

  return (
    <div class={styles.authContainer}>
      <div class={styles.authCard}>
        <div class={styles.authHeader}>
          <h2 class={styles.authTitle}>Solid Authentication</h2>
          <p class={styles.authDescription}>
            {isLoggedIn() ? 'You are logged in' : 'Log in to your Solid Pod'}
          </p>
        </div>
        <div class={styles.authContent}>
          <Show when={!isLoggedIn()}>
            <div class={styles.formGroup}>
              <label for="issuer" class={styles.label}>Solid Identity Provider</label>
              <input
                id="issuer"
                class={styles.input}
                value={issuer()}
                onInput={(e: InputEvent) => setIssuer((e.target as HTMLInputElement).value)}
                placeholder="Enter your Solid Identity Provider"
              />
            </div>
          </Show>
          <Show when={isLoggedIn()}>
            <div class={styles.infoGroup}>
              <p class={styles.infoLabel}>WebID:</p>
              <p class={styles.infoValue}>{webId()}</p>
            </div>
          </Show>
        </div>
        <div class={styles.authFooter}>
          <Show when={!isLoggedIn()}>
            <button
              class={styles.primaryButton}
              onClick={handleLogin}
              disabled={loading()}
            >
              {loading() ? 'Logging in...' : 'Log In'}
            </button>
          </Show>
          <Show when={isLoggedIn()}>
            <button
              class={styles.primaryButton}
              onClick={handleLogout}
              disabled={loading()}
            >
              {loading() ? 'Logging out...' : 'Log Out'}
            </button>
          </Show>
          <button
            class={styles.dangerButton}
            onClick={clearLocalStorage}
          >
            Clear Auth Data
          </button>
        </div>
      </div>
    </div>
  );
}
