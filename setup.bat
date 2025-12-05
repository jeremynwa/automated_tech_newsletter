@echo off
REM Setup script for Windows

echo Setting up Automated Tech Newsletter...
echo.

REM Create directories
echo Creating directories...
if not exist logs mkdir logs
if not exist archive mkdir archive
if not exist webapp\static mkdir webapp\static
if not exist webapp\templates mkdir webapp\templates

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    (
        echo # API Keys
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo HF_API_KEY=your_huggingface_api_key_here
        echo.
        echo # Settings
        echo MAX_ARTICLES_PER_SOURCE=3
        echo ARCHIVE_DIR=archive
        echo.
        echo # Web App
        echo PORT=8080
    ) > .env
    echo WARNING: Please edit .env and add your API keys!
) else (
    echo .env file already exists
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env and add your API keys
echo 2. Test: python main.py
echo 3. Setup Windows Task Scheduler (see WINDOWS_SETUP.md)
echo 4. Start web app: python webapp\app.py

pause