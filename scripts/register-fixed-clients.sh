#!/bin/bash

# Script to register client applications with the Solid server
# This allows client IDs to be consistent across server restarts

# Configuration
SOLID_SERVER="http://localhost:3000"
APP1_NAME="Solid File Manager"
APP1_URL="http://localhost:5173"
APP1_CLIENT_ID="iNjPmF4z0lRNYbV87EYw8"
APP1_CLIENT_SECRET="your_client_secret_here"

APP2_NAME="Solid Pod Manager (App2)"
APP2_URL="http://localhost:5174"
APP2_CLIENT_ID="aXk8kgN_ZhypjsrBC9GQn"
APP2_CLIENT_SECRET="your_app2_client_secret_here"

WELLDATA_NAME="welldata"
WELLDATA_URL="http://localhost:5175"
WELLDATA_CLIENT_ID="welldata-id-static"
WELLDATA_CLIENT_SECRET="welldata-secret-static"

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
    \"scope\": \"openid profile offline_access webid\",
    \"client_id\": \"$APP1_CLIENT_ID\",
    \"client_secret\": \"$APP1_CLIENT_SECRET\"
  }")

if echo "$APP1_RESPONSE" | grep -q "\"client_id\":\"$APP1_CLIENT_ID\""; then
  echo "Successfully registered $APP1_NAME with fixed client ID: $APP1_CLIENT_ID"
  
  # Save client credentials to a file
  echo "{\"client_id\":\"$APP1_CLIENT_ID\",\"client_secret\":\"$APP1_CLIENT_SECRET\"}" > ./.data/client-credentials/app1-credentials.json
else
  echo "Failed to register $APP1_NAME with fixed client ID"
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
    \"scope\": \"openid profile offline_access webid\",
    \"client_id\": \"$APP2_CLIENT_ID\",
    \"client_secret\": \"$APP2_CLIENT_SECRET\"
  }")

if echo "$APP2_RESPONSE" | grep -q "\"client_id\":\"$APP2_CLIENT_ID\""; then
  echo "Successfully registered $APP2_NAME with fixed client ID: $APP2_CLIENT_ID"
  
  # Save client credentials to a file
  echo "{\"client_id\":\"$APP2_CLIENT_ID\",\"client_secret\":\"$APP2_CLIENT_SECRET\"}" > ./.data/client-credentials/app2-credentials.json
else
  echo "Failed to register $APP2_NAME with fixed client ID"
  echo "Response: $APP2_RESPONSE"
fi

# Register welldata application
echo "Registering $WELLDATA_NAME..."
WELLDATA_RESPONSE=$(curl -s -X POST \
  "$SOLID_SERVER/.oidc/reg" \
  -H "Content-Type: application/json" \
  -d "{
    \"application_type\": \"web\",
    \"redirect_uris\": [\"$WELLDATA_URL\"],
    \"client_name\": \"$WELLDATA_NAME\",
    \"scope\": \"openid profile offline_access webid\",
    \"client_id\": \"$WELLDATA_CLIENT_ID\",
    \"client_secret\": \"$WELLDATA_CLIENT_SECRET\"
  }")

if echo "$WELLDATA_RESPONSE" | grep -q "\"client_id\":\"$WELLDATA_CLIENT_ID\""; then
  echo "Successfully registered $WELLDATA_NAME with fixed client ID: $WELLDATA_CLIENT_ID"
  
  # Save client credentials to a file
  echo "{\"client_id\":\"$WELLDATA_CLIENT_ID\",\"client_secret\":\"$WELLDATA_CLIENT_SECRET\"}" > ./.data/client-credentials/welldata-credentials.json
else
  echo "Failed to register $WELLDATA_NAME with fixed client ID"
  echo "Response: $WELLDATA_RESPONSE"
fi

echo "Client registration complete."
echo "You can now modify your applications to use these fixed client IDs."

# Save all credentials to the shared file
echo "{
  \"app1\": {
    \"client_id\": \"$APP1_CLIENT_ID\",
    \"client_secret\": \"$APP1_CLIENT_SECRET\",
    \"name\": \"$APP1_NAME\",
    \"redirect_uri\": \"$APP1_URL\"
  },
  \"welldata\": {
    \"client_id\": \"$WELLDATA_CLIENT_ID\",
    \"client_secret\": \"$WELLDATA_CLIENT_SECRET\",
    \"name\": \"$WELLDATA_NAME\",
    \"redirect_uri\": \"$WELLDATA_URL\"
  },
  \"app2\": {
    \"client_id\": \"$APP2_CLIENT_ID\",
    \"client_secret\": \"$APP2_CLIENT_SECRET\",
    \"name\": \"$APP2_NAME\",
    \"redirect_uri\": \"$APP2_URL\"
  }
}" > ./shared/client-credentials.json 