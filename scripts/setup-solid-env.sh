#!/bin/bash

# Master script to set up the Solid environment with persistent client IDs
# This script will:
# 1. Start the Solid server
# 2. Register client applications
# 3. Update application components to use fixed client IDs
# 4. Apply the changes
# 5. Start the applications

# Create necessary directories
mkdir -p ./.data/client-credentials ./.data/accounts ./.data/pods

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Solid environment with persistent client IDs...${NC}"

# Step 1: Start the Solid server
echo -e "${GREEN}Step 1: Starting Solid server...${NC}"
echo "Starting Solid server in the background..."
npm run start:server &
SOLID_SERVER_PID=$!

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 5

# Step 2: Register client applications
echo -e "${GREEN}Step 2: Registering client applications...${NC}"
./scripts/register-clients.sh

# Check if registration was successful
if [ ! -f ./.data/client-credentials/app1-credentials.json ] || [ ! -f ./.data/client-credentials/app2-credentials.json ]; then
  echo -e "${RED}Client registration failed. Please check the server logs.${NC}"
  echo "Stopping the Solid server..."
  kill $SOLID_SERVER_PID
  exit 1
fi

# Step 3: Update application components
echo -e "${GREEN}Step 3: Updating application components...${NC}"
./scripts/update-app-clients.sh

# Step 4: Apply the changes
echo -e "${GREEN}Step 4: Applying changes to applications...${NC}"
cp app/src/components/AuthManager.fixed.tsx app/src/components/AuthManager.tsx
cp app2/src/components/AuthManager.fixed.tsx app2/src/components/AuthManager.tsx

echo "Changes applied successfully."

# Step 5: Start the applications
echo -e "${GREEN}Step 5: Starting applications...${NC}"
echo "Starting app1 in the background..."
(cd app && npm run dev) &
APP1_PID=$!

echo "Starting app2 in the background..."
(cd app2 && npm run dev) &
APP2_PID=$!

# Wait for the applications to start
sleep 5

echo -e "${GREEN}Setup complete!${NC}"
echo "Solid server is running at http://localhost:3000"
echo "App1 is running at http://localhost:5173"
echo "App2 is running at http://localhost:5174"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "1. If you encounter authentication issues, use the 'Clear Auth Data' button in the applications"
echo "2. Alternatively, use the bookmarklet described in scripts/README.md"
echo "3. To stop all servers, run: pkill -f 'community-solid-server' && pkill -f 'vite'"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for user to press Ctrl+C
wait 