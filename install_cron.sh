#!/bin/bash

# Script to install cron job for daily tech digest generation
# Runs at 7:00 AM CET every day

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="$SCRIPT_DIR/logs"
RUN_SCRIPT="$SCRIPT_DIR/run_daily.sh"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Make run script executable
chmod +x "$RUN_SCRIPT"

# Remove any existing cron jobs for this project
crontab -l 2>/dev/null | grep -v "run_daily.sh" | crontab -

# Add new cron job
# 7 AM CET = 6 AM UTC (during standard time) or 5 AM UTC (during daylight saving)
# Using 6 AM UTC as base - adjust if needed
CRON_SCHEDULE="0 6 * * *"

# Add cron job
(crontab -l 2>/dev/null; echo "$CRON_SCHEDULE cd $SCRIPT_DIR && $RUN_SCRIPT >> $LOG_DIR/cron.log 2>&1") | crontab -

echo "✅ Cron job installed successfully!"
echo "📅 Schedule: Daily at 7:00 AM CET (6:00 AM UTC)"
echo "📝 Logs: $LOG_DIR/cron.log"
echo ""
echo "Current crontab:"
crontab -l
echo ""
echo "To test manually, run: $RUN_SCRIPT"