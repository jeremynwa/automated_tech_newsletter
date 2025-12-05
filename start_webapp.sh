#!/bin/bash

# Script to start the tech digest web application

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="$SCRIPT_DIR/logs"
VENV_DIR="$SCRIPT_DIR/venv"
PORT="${PORT:-8080}"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Activate virtual environment
if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
else
    echo "ERROR: Virtual environment not found at $VENV_DIR"
    echo "Run ./setup.sh first"
    exit 1
fi

# Change to project directory
cd "$SCRIPT_DIR"

echo "🚀 Starting Tech Digest Web App on port $PORT..."
echo "📝 Logs: $LOG_DIR/access.log and $LOG_DIR/error.log"
echo "🌐 Access at: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start with gunicorn (production) or flask (development)
if command -v gunicorn &> /dev/null; then
    gunicorn -w 4 -b 0.0.0.0:$PORT webapp.app:app \
        --access-logfile "$LOG_DIR/access.log" \
        --error-logfile "$LOG_DIR/error.log"
else
    echo "⚠️  Gunicorn not found, using Flask development server"
    python webapp/app.py
fi