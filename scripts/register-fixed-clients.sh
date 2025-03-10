#!/bin/bash

# Script to register fixed client IDs with the Solid server
# This ensures that the client IDs are consistent across restarts

set -e

echo "Registering fixed client IDs with the Solid server..."

# Read credentials from shared file
APP1_CLIENT_ID=$(jq -r '.app1.client_id' shared/client-credentials.json)
APP1_CLIENT_SECRET=$(jq -r '.app1.client_secret' shared/client-credentials.json)
APP1_NAME=$(jq -r '.app1.name' shared/client-credentials.json)
APP1_REDIRECT_URI=$(jq -r '.app1.redirect_uri' shared/client-credentials.json)

APP2_CLIENT_ID=$(jq -r '.app2.client_id' shared/client-credentials.json)
APP2_CLIENT_SECRET=$(jq -r '.app2.client_secret' shared/client-credentials.json)
APP2_NAME=$(jq -r '.app2.name' shared/client-credentials.json)
APP2_REDIRECT_URI=$(jq -r '.app2.redirect_uri' shared/client-credentials.json)

# Ensure the client-credentials directory exists
mkdir -p ./.data/client-credentials

# Register App1 with fixed client ID
echo "Registering $APP1_NAME with client ID: $APP1_CLIENT_ID"
curl -X POST http://localhost:3000/.oidc/reg \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"$APP1_CLIENT_ID\",
    \"client_secret\": \"$APP1_CLIENT_SECRET\",
    \"redirect_uris\": [\"$APP1_REDIRECT_URI\"],
    \"grant_types\": [\"authorization_code\", \"refresh_token\"],
    \"client_name\": \"$APP1_NAME\"
  }" > ./.data/client-credentials/app1-credentials.json

# Register App2 with fixed client ID
echo "Registering $APP2_NAME with client ID: $APP2_CLIENT_ID"
curl -X POST http://localhost:3000/.oidc/reg \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"$APP2_CLIENT_ID\",
    \"client_secret\": \"$APP2_CLIENT_SECRET\",
    \"redirect_uris\": [\"$APP2_REDIRECT_URI\"],
    \"grant_types\": [\"authorization_code\", \"refresh_token\"],
    \"client_name\": \"$APP2_NAME\"
  }" > ./.data/client-credentials/app2-credentials.json

echo "Client registration complete."
echo "App1 Client ID: $APP1_CLIENT_ID"
echo "App2 Client ID: $APP2_CLIENT_ID" 