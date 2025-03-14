# Solid Client Registration Scripts

This directory contains scripts to help manage client registrations for Solid applications. These scripts are particularly useful for development and testing environments where you need consistent client IDs across server restarts.

## Available Scripts

### `register-fixed-clients.sh`

This script registers your client applications with the Solid server using predefined client IDs and saves the client credentials to files in the `.data/client-credentials/` directory.

**Usage:**
```bash
./scripts/register-fixed-clients.sh
```

**What it does:**
- Reads application details from the shared client credentials file at `./shared/client-credentials.json`
- Registers all applications with the Solid server using the client IDs defined in the shared file
- Saves the registration responses to JSON files in the `.data/client-credentials/` directory
- Ensures client IDs remain consistent across server restarts

**Note:** The `./shared/client-credentials.json` file is an input to this script, not created by it. Developers can modify this file to change application names, redirect URIs, and client IDs before running the registration script.

## Workflow for Persistent Client IDs

The client registration process is now integrated into the npm scripts:

```bash
# Start everything with a single command (server, client registration, and apps)
npm run dev

# Or for minimal setup (just server, client registration, and welldata app)
npm run dev:minimal
```

These commands will:
1. Start the Solid server
2. Wait for the server to be ready
3. Register client applications with fixed IDs
4. Start the web applications

## Troubleshooting

If you encounter authentication issues:

1. Clear your browser's local storage for the application domains using the "Clear Auth Data" button
2. Restart the development environment with `npm run dev` or `npm run dev:minimal`

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