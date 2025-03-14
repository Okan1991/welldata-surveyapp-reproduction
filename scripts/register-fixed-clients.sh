#!/bin/bash

# Script to register client applications with the Solid server
# This allows client IDs to be consistent across server restarts

# Configuration
SOLID_SERVER="http://localhost:3000"
CREDENTIALS_FILE="./shared/client-credentials.json"
OUTPUT_DIR="./.data/client-credentials"

echo "SOLID CLIENT REGISTRATION SCRIPT"
echo "Server URL: $SOLID_SERVER"
echo "Credentials file: $CREDENTIALS_FILE"

# Check if the Solid server is running with retry logic
MAX_RETRIES=10
RETRY_COUNT=0
SERVER_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$SERVER_READY" = false ]; do
  if curl -s --head --fail "$SOLID_SERVER" > /dev/null; then
    SERVER_READY=true
    echo "Server is running at $SOLID_SERVER"
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "Waiting for server to start (attempt $RETRY_COUNT/$MAX_RETRIES)..."
      sleep 2
    else
      echo "ERROR: Solid server is not running at $SOLID_SERVER after $MAX_RETRIES attempts"
      echo "Please start the server before running this script."
      exit 1
    fi
  fi
done

# Check if the credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
  echo "ERROR: Client credentials file not found at $CREDENTIALS_FILE"
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Create a temporary Python script to extract app IDs
cat > /tmp/extract_app_ids.py << 'EOF'
import json
import sys

try:
    with open(sys.argv[1], 'r') as f:
        data = json.load(f)
    for app_id in data.keys():
        print(app_id)
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
EOF

# Create a temporary Python script to extract app details
cat > /tmp/extract_app_details.py << 'EOF'
import json
import sys

try:
    with open(sys.argv[1], 'r') as f:
        data = json.load(f)
    app_id = sys.argv[2]
    if app_id in data:
        app_data = data[app_id]
        print(app_data.get('name', ''))
        print(app_data.get('redirect_uri', ''))
        print(app_data.get('client_id', ''))
        print(app_data.get('client_secret', ''))
    else:
        print(f'Error: App ID {app_id} not found in credentials file', file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
EOF

# Array to store registration results
declare -a REGISTRATION_RESULTS=()

# Extract app IDs using Python
APP_IDS=$(python3 /tmp/extract_app_ids.py "$CREDENTIALS_FILE")

# Check if any app IDs were found
if [ -z "$APP_IDS" ]; then
  echo "ERROR: No application IDs found in the credentials file."
  echo "Please check the format of $CREDENTIALS_FILE"
  exit 1
fi

# Register each application from the credentials file
for APP_ID in $APP_IDS; do
  echo "Processing application: $APP_ID"
  
  # Extract all app details at once
  APP_DETAILS=$(python3 /tmp/extract_app_details.py "$CREDENTIALS_FILE" "$APP_ID")
  
  # Read the details into variables
  APP_NAME=$(echo "$APP_DETAILS" | sed -n '1p')
  APP_URL=$(echo "$APP_DETAILS" | sed -n '2p')
  CLIENT_ID=$(echo "$APP_DETAILS" | sed -n '3p')
  CLIENT_SECRET=$(echo "$APP_DETAILS" | sed -n '4p')
  
  # Check if all required values were extracted
  if [ -z "$APP_NAME" ] || [ -z "$APP_URL" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "ERROR: Could not extract all required values for $APP_ID"
    continue
  fi
  
  OUTPUT_FILE="$OUTPUT_DIR/${APP_ID}-credentials.json"
  
  # Create the JSON payload
  PAYLOAD="{
    \"application_type\": \"web\",
    \"redirect_uris\": [\"$APP_URL\"],
    \"client_name\": \"$APP_NAME\",
    \"scope\": \"openid profile offline_access webid\",
    \"client_id\": \"$CLIENT_ID\",
    \"client_secret\": \"$CLIENT_SECRET\"
  }"
  
  # Display the curl command that will be executed
  echo "CURL COMMAND:"
  echo "curl -X POST \"$SOLID_SERVER/.oidc/reg\" \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '$PAYLOAD'"
  
  # Send the registration request
  RESPONSE=$(curl -s -X POST "$SOLID_SERVER/.oidc/reg" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")
  
  # Save the response to the output file
  echo "$RESPONSE" > "$OUTPUT_FILE"
  
  # Check if the response contains an error
  if echo "$RESPONSE" | grep -q "\"error\":"; then
    echo "ERROR: Registration failed for $APP_NAME"
    REGISTRATION_RESULTS+=("$APP_NAME (ERROR): Registration failed")
  else
    # Extract the actual client_id from the response
    REGISTERED_CLIENT_ID=$(echo "$RESPONSE" | grep -o "\"client_id\":\"[^\"]*\"" | cut -d'"' -f4)
    
    # Store the result for summary
    REGISTRATION_RESULTS+=("$APP_NAME: $REGISTERED_CLIENT_ID")
  fi
done

# Clean up temporary Python scripts
rm -f /tmp/extract_app_ids.py /tmp/extract_app_details.py

echo "Client registration complete."

# Print summary of registration results
echo "REGISTRATION SUMMARY"
echo "The following applications were registered:"
for RESULT in "${REGISTRATION_RESULTS[@]}"; do
  echo "  $RESULT"
done

# Create a summary file
SUMMARY_FILE="$OUTPUT_DIR/registration-summary.txt"
echo "Registration Summary - $(date)" > "$SUMMARY_FILE"
for RESULT in "${REGISTRATION_RESULTS[@]}"; do
  echo "$RESULT" >> "$SUMMARY_FILE"
done
echo "Summary saved to $SUMMARY_FILE" 