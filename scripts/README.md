# Solid Client Registration Scripts

This directory contains scripts to help manage client registrations for Solid applications. These scripts are particularly useful for development and testing environments where you need consistent client IDs across server restarts.

## Available Scripts

### 1. `register-clients.sh`

This script registers your client applications with the Solid server and saves the client credentials to files in the `.data/client-credentials/` directory.

**Usage:**
```bash
./scripts/register-clients.sh
```

**What it does:**
- Registers both applications with the Solid server
- Saves the client credentials (client ID and client secret) to JSON files
- Outputs the client IDs and secrets for reference

### 2. `update-app-clients.sh`

This script creates modified versions of the AuthManager components for both applications, configured to use the fixed client IDs obtained from the registration process.

**Usage:**
```bash
./scripts/update-app-clients.sh
```

**What it does:**
- Reads the client IDs from the saved credential files
- Creates modified versions of the AuthManager components with fixed client IDs
- Outputs instructions for applying the changes

## Workflow for Persistent Client IDs

1. Start the Solid server:
   ```bash
   npm run start:server
   ```

2. Register the client applications:
   ```bash
   ./scripts/register-clients.sh
   ```

3. Update the applications to use the fixed client IDs:
   ```bash
   ./scripts/update-app-clients.sh
   ```

4. Apply the changes to the applications:
   ```bash
   cp app/src/components/AuthManager.fixed.tsx app/src/components/AuthManager.tsx
   cp app2/src/components/AuthManager.fixed.tsx app2/src/components/AuthManager.tsx
   ```

5. Start the applications:
   ```bash
   cd app && npm run dev
   cd app2 && npm run dev
   ```

## Troubleshooting

If you encounter authentication issues:

1. Clear your browser's local storage for the application domains
2. Restart the Solid server
3. Run the registration script again
4. Apply the updated components to the applications

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