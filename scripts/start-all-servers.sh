#!/bin/bash

# Script to start all servers with the correct configuration
# This ensures that the client IDs are consistent across restarts

set -e

echo "Starting all servers with fixed client IDs..."

# Kill any existing servers
echo "Stopping any existing servers..."
pkill -f "community-solid-server" || true
pkill -f "vite" || true

# Start the Solid server
echo "Starting Solid server..."
npm run start:server &
SOLID_PID=$!

# Wait for the server to start
echo "Waiting for Solid server to start..."
sleep 5

# Register the clients
echo "Registering clients with fixed IDs..."
./scripts/register-fixed-clients.sh

# Start the applications
echo "Starting App1..."
(cd app && npm run dev) &
APP1_PID=$!

echo "Starting App2..."
(cd app2 && npm run dev) &
APP2_PID=$!

echo "All servers started successfully!"
echo "Solid server: http://localhost:3000"
echo "App1: http://localhost:5173"
echo "App2: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
wait $SOLID_PID $APP1_PID $APP2_PID 