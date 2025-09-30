#!/bin/bash
# startup.sh - Quick start script for BEnQA Quiz Application

echo "🚀 Starting BEnQA Quiz Application..."

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
pip3 install flask flask-cors

# Copy questions data if it exists
if [ -f "data/questions.json" ]; then
    echo "✅ Questions data found"
else
    echo "⚠️  Questions data not found. Make sure to run the data preparation step first."
fi

# Start the application
echo "🌐 Starting web server at http://localhost:5000"
echo "📊 Access your quiz platform in your web browser"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Use the fixed version if it exists, otherwise use the original
if [ -f "app_fixed.py" ]; then
    echo "🔧 Using fixed version with enhanced debugging..."
    python3 app_fixed.py
else
    echo "📱 Using original version..."
    python3 app.py
fi
