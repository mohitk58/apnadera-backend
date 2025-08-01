#!/bin/bash

# Backend Deployment Script
echo "🚀 Deploying ApnaDera Backend..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the apnadera-backend directory"
    exit 1
fi

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "⚠️  Warning: config.env not found. Please create it from config.env.example"
    echo "📝 Copy config.env.example to config.env and update the values"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Test the server
echo "🧪 Testing server startup..."
timeout 10s npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Server started successfully"
    kill $SERVER_PID
else
    echo "❌ Server failed to start"
    exit 1
fi

echo "🎉 Backend is ready for deployment!"
echo "📋 Next steps:"
echo "   1. Set up your hosting service (Heroku, Railway, etc.)"
echo "   2. Configure environment variables"
echo "   3. Deploy using your hosting service's deployment method" 