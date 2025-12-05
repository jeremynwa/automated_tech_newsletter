@echo off
REM Script to start the tech digest web application on Windows

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Create logs directory
if not exist logs mkdir logs

REM Activate virtual environment
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found
    echo Run setup.bat first
    pause
    exit /b 1
)

REM Set port
if not defined PORT set PORT=8080

echo Starting Tech Digest Web App on port %PORT%...
echo Logs: logs\access.log and logs\error.log
echo Access at: http://localhost:%PORT%
echo.
echo Press Ctrl+C to stop
echo.

REM Check if gunicorn is available
where gunicorn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    REM Production mode with gunicorn
    gunicorn -w 4 -b 0.0.0.0:%PORT% webapp.app:app --access-logfile logs\access.log --error-logfile logs\error.log
) else (
    REM Development mode with Flask
    echo WARNING: Gunicorn not found, using Flask development server
    python webapp\app.py
)