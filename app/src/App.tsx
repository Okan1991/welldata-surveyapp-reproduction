import Auth from './components/Auth';
import PodManager from './components/PodManager';
import styles from './App.module.css';

function App() {
  return (
    <div class={styles.App}>
      <header class={styles.header} style="display: flex; justify-content: space-between; align-items: center; padding: 0 16px;">
        <div class={styles.headerContent}>
          <svg class={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <h1>SOLID Test App</h1>
        </div>
        <Auth />
      </header>
      <main>
        <PodManager />
      </main>
    </div>
  );
}

export default App;
