#!/bin/bash

# Script to register client applications with the Solid server
# This allows client IDs to be consistent across server restarts

# Configuration
SOLID_SERVER="http://localhost:3000"
CREDENTIALS_FILE="./shared/client-credentials.json"

# Check if the credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
  echo "Error: Client credentials file not found at $CREDENTIALS_FILE"
  exit 1
fi

# Create .data/client-credentials directory if it doesn't exist
mkdir -p ./.data/client-credentials

echo "Registering client applications with the Solid server..."

# Function to extract values from JSON
extract_value() {
  local app=$1
  local key=$2
  grep -o "\"$app\":{[^}]*\"$key\":\"[^\"]*\"" "$CREDENTIALS_FILE" | grep -o "\"$key\":\"[^\"]*\"" | cut -d'"' -f4
}

# Register each application from the credentials file
for APP_ID in $(grep -o "\"[^\"]*\":{" "$CREDENTIALS_FILE" | cut -d'"' -f2); do
  APP_NAME=$(extract_value "$APP_ID" "name")
  APP_URL=$(extract_value "$APP_ID" "redirect_uri")
  CLIENT_ID=$(extract_value "$APP_ID" "client_id")
  CLIENT_SECRET=$(extract_value "$APP_ID" "client_secret")
  
  echo "Registering $APP_NAME..."
  curl -X POST "$SOLID_SERVER/.oidc/reg" \
    -H "Content-Type: application/json" \
    -d "{
      \"application_type\": \"web\",
      \"redirect_uris\": [\"$APP_URL\"],
      \"client_name\": \"$APP_NAME\",
      \"scope\": \"openid profile offline_access webid\",
      \"client_id\": \"$CLIENT_ID\",
      \"client_secret\": \"$CLIENT_SECRET\"
    }" > ./.data/client-credentials/${APP_ID}-credentials.json
done

echo "Client registration complete."
echo "All applications have been registered with their fixed client IDs from $CREDENTIALS_FILE" 