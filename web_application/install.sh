#!/bin/bash

# BEnQA Quiz Platform Installation Script
echo "🚀 Setting up BEnQA Quiz Platform for School Project..."
echo "=================================================="

# Check Python version
echo "📋 Checking Python version..."
python3 --version

# Create virtual environment (optional but recommended)
echo "🔧 Creating virtual environment..."
python3 -m venv benqa_env

# Activate virtual environment
echo "⚡ Activating virtual environment..."
source benqa_env/bin/activate

# Install required packages
echo "📦 Installing required packages..."
pip install -r requirements.txt

# Check if data files exist
echo "📊 Checking data files..."
if [ -f "data/questions.json" ]; then
    echo "✅ Questions database found"
else
    echo "❌ Questions database missing - please ensure questions.json is in data/ folder"
fi

echo "🎉 Installation completed!"
echo "To run the application:"
echo "  1. Activate virtual environment: source benqa_env/bin/activate"
echo "  2. Run the application: python3 app.py"
echo "  3. Open browser: http://localhost:5001"
