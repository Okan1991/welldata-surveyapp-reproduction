#!/bin/bash

# Script to register client applications with the Solid server
# This allows client IDs to be consistent across server restarts

# Configuration
SOLID_SERVER="http://localhost:3000"
APP1_NAME="Solid File Manager"
APP1_URL="http://localhost:5173"
APP2_NAME="Solid Pod Manager - Alternative UI"
APP2_URL="http://localhost:5174"

# Create .data/client-credentials directory if it doesn't exist
mkdir -p ./.data/client-credentials

echo "Registering client applications with the Solid server..."

# Register the first application
echo "Registering $APP1_NAME..."
APP1_RESPONSE=$(curl -s -X POST \
  "$SOLID_SERVER/.oidc/reg" \
  -H "Content-Type: application/json" \
  -d "{
    \"application_type\": \"web\",
    \"redirect_uris\": [\"$APP1_URL\"],
    \"client_name\": \"$APP1_NAME\",
    \"scope\": \"openid profile offline_access webid\"
  }")

APP1_CLIENT_ID=$(echo $APP1_RESPONSE | grep -o '"client_id":"[^"]*"' | cut -d'"' -f4)
APP1_CLIENT_SECRET=$(echo $APP1_RESPONSE | grep -o '"client_secret":"[^"]*"' | cut -d'"' -f4)

if [ -n "$APP1_CLIENT_ID" ]; then
  echo "Successfully registered $APP1_NAME with client ID: $APP1_CLIENT_ID"
  echo "Client ID: $APP1_CLIENT_ID"
  echo "Client Secret: $APP1_CLIENT_SECRET"
  
  # Save client credentials to a file
  echo "{\"client_id\":\"$APP1_CLIENT_ID\",\"client_secret\":\"$APP1_CLIENT_SECRET\"}" > ./.data/client-credentials/app1-credentials.json
else
  echo "Failed to register $APP1_NAME"
  echo "Response: $APP1_RESPONSE"
fi

# Register the second application
echo "Registering $APP2_NAME..."
APP2_RESPONSE=$(curl -s -X POST \
  "$SOLID_SERVER/.oidc/reg" \
  -H "Content-Type: application/json" \
  -d "{
    \"application_type\": \"web\",
    \"redirect_uris\": [\"$APP2_URL\"],
    \"client_name\": \"$APP2_NAME\",
    \"scope\": \"openid profile offline_access webid\"
  }")

APP2_CLIENT_ID=$(echo $APP2_RESPONSE | grep -o '"client_id":"[^"]*"' | cut -d'"' -f4)
APP2_CLIENT_SECRET=$(echo $APP2_RESPONSE | grep -o '"client_secret":"[^"]*"' | cut -d'"' -f4)

if [ -n "$APP2_CLIENT_ID" ]; then
  echo "Successfully registered $APP2_NAME with client ID: $APP2_CLIENT_ID"
  echo "Client ID: $APP2_CLIENT_ID"
  echo "Client Secret: $APP2_CLIENT_SECRET"
  
  # Save client credentials to a file
  echo "{\"client_id\":\"$APP2_CLIENT_ID\",\"client_secret\":\"$APP2_CLIENT_SECRET\"}" > ./.data/client-credentials/app2-credentials.json
else
  echo "Failed to register $APP2_NAME"
  echo "Response: $APP2_RESPONSE"
fi

echo "Client registration complete."
echo "You can now modify your applications to use these fixed client IDs." 