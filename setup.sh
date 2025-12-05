#!/bin/bash

# Setup script for automated tech newsletter

echo "🚀 Setting up Automated Tech Newsletter..."
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p archive
mkdir -p webapp/static
mkdir -p webapp/templates

# Create virtual environment
echo "🐍 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your_huggingface_api_key_here

# Settings
MAX_ARTICLES_PER_SOURCE=3
ARCHIVE_DIR=archive

# Web App
PORT=8080
EOF
    echo "⚠️  Please edit .env and add your API keys!"
else
    echo "✅ .env file already exists"
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x run_daily.sh
chmod +x install_cron.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys"
echo "2. Test the pipeline: python main.py"
echo "3. Install cron job: ./install_cron.sh"
echo "4. Start web app: python webapp/app.py"