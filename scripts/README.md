# Solid Client Registration Scripts

This directory contains scripts to help manage client registrations for Solid applications. These scripts are particularly useful for development and testing environments where you need consistent client IDs across server restarts.

## Available Scripts

### 1. `register-fixed-clients.sh`

This script registers your client applications with the Solid server using predefined client IDs and saves the client credentials to files in the `.data/client-credentials/` directory.

**Usage:**
```bash
./scripts/register-fixed-clients.sh
```

**What it does:**
- Registers all applications with the Solid server using fixed client IDs
- Saves the client credentials (client ID and client secret) to JSON files
- Creates a shared client credentials file at `./shared/client-credentials.json`
- Ensures client IDs remain consistent across server restarts

### 2. `start-all-servers.sh`

This script starts all servers (Solid server and both web applications) with the correct configuration.

**Usage:**
```bash
./scripts/start-all-servers.sh
```

**What it does:**
- Stops any existing servers
- Starts the Solid server
- Registers clients with fixed IDs using `register-fixed-clients.sh`
- Starts both web applications
- Provides URLs for accessing all components

## Workflow for Persistent Client IDs

1. Start all servers with a single command:
   ```bash
   ./scripts/start-all-servers.sh
   ```

   Or follow these steps individually:

2. Start the Solid server:
   ```bash
   npm run start:server
   ```

3. Register the client applications with fixed IDs:
   ```bash
   ./scripts/register-fixed-clients.sh
   ```

4. Start the applications:
   ```bash
   cd app && npm run dev
   cd app2 && npm run dev
   ```

## Troubleshooting

If you encounter authentication issues:

1. Clear your browser's local storage for the application domains using the "Clear Auth Data" button
2. Restart the Solid server
3. Run the registration script again: `./scripts/register-fixed-clients.sh`
4. Restart the applications

## Manual Browser Storage Clearing

If you can't access the "Clear Auth Data" button in the applications, you can manually clear the browser's local storage:

1. Open your browser's developer tools (F12 or right-click and select "Inspect")
2. Go to the "Application" tab (in Chrome) or "Storage" tab (in Firefox)
3. Select "Local Storage" from the left sidebar
4. Find the entries for `http://localhost:5173` and `http://localhost:5174`
5. Delete all items that start with `solid-` or contain `oidc`
6. Reload the page

### Using the Bookmarklet

For convenience, you can create a bookmarklet to clear Solid-related storage with a single click:

1. Create a new bookmark in your browser
2. Name it "Clear Solid Storage"
3. For the URL/location, paste this code:
   ```
   javascript:(function(){console.log('Clearing Solid-related items from localStorage...');let e=0;for(let o=0;o<localStorage.length;o++){const r=localStorage.key(o);r&&(r.startsWith('solid-')||r.includes('oidc'))&&(console.log(`Removing: ${r}`),localStorage.removeItem(r),e++,o--)}console.log(`Cleared ${e} items from localStorage.`),'undefined'!=typeof window&&(console.log('Reloading page...'),window.location.reload())})();
   ```
4. Save the bookmark
5. When you encounter authentication issues, simply click this bookmark while on the application page

This will clear all Solid-related items from local storage and reload the page, allowing you to start fresh with authentication. 