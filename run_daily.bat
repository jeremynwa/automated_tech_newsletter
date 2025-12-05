@echo off
REM Daily execution script for Windows
REM Called by Windows Task Scheduler

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Create logs directory if needed
if not exist logs mkdir logs

REM Log timestamp
echo ======================================== >> logs\cron.log
echo Starting tech digest generation at %date% %time% >> logs\cron.log

REM Activate virtual environment
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found >> logs\cron.log
    exit /b 1
)

REM Run main script
python main.py >> logs\cron.log 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Tech digest generated successfully at %date% %time% >> logs\cron.log
) else (
    echo Tech digest generation failed with exit code %ERRORLEVEL% at %date% %time% >> logs\cron.log
)

echo ======================================== >> logs\cron.log
echo. >> logs\cron.log

exit /b %ERRORLEVEL%