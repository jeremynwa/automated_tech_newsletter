#!/bin/bash

# Daily execution script for tech digest
# Called by cron job

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="$SCRIPT_DIR/logs"
VENV_DIR="$SCRIPT_DIR/venv"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Log timestamp
echo "========================================" >> "$LOG_DIR/cron.log"
echo "Starting tech digest generation at $(date)" >> "$LOG_DIR/cron.log"

# Activate virtual environment
if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
else
    echo "ERROR: Virtual environment not found at $VENV_DIR" >> "$LOG_DIR/cron.log"
    exit 1
fi

# Change to project directory
cd "$SCRIPT_DIR"

# Run the main script
python main.py >> "$LOG_DIR/cron.log" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Tech digest generated successfully at $(date)" >> "$LOG_DIR/cron.log"
else
    echo "❌ Tech digest generation failed with exit code $EXIT_CODE at $(date)" >> "$LOG_DIR/cron.log"
fi

echo "========================================" >> "$LOG_DIR/cron.log"
echo "" >> "$LOG_DIR/cron.log"

exit $EXIT_CODE