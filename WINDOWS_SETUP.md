# Windows Setup Guide

## Quick Start

### 1. Initial Setup
```powershell
# Run setup
.\setup.bat

# Configure API keys
notepad .env
```

### 2. Test the Pipeline
```powershell
# Activate virtual environment
venv\Scripts\activate

# Generate digest
python main.py

# Start web app
python webapp\app.py
# Visit http://localhost:8080
```

### 3. Setup Automated Daily Execution

#### Option A: Using Task Scheduler GUI (Easiest)

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type `taskschd.msc`
   - Press Enter

2. **Create Basic Task**
   - Click "Create Basic Task" in right panel
   - Name: `Tech Digest Daily`
   - Description: `Generate daily tech newsletter`
   - Click Next

3. **Set Trigger**
   - Select "Daily"
   - Click Next
   - Start date: Today
   - Time: `07:00:00` (7 AM)
   - Recur every: `1 days`
   - Click Next

4. **Set Action**
   - Select "Start a program"
   - Click Next
   - Program/script: Browse to `run_daily.bat` in your project folder
     - Example: `C:\Users\jerem\Documents\Projects\automated_tech_newsletter\automated_tech_newsletter\run_daily.bat`
   - Start in: Your project folder
     - Example: `C:\Users\jerem\Documents\Projects\automated_tech_newsletter\automated_tech_newsletter`
   - Click Next

5. **Finish**
   - Check "Open Properties dialog when I click Finish"
   - Click Finish

6. **Additional Settings** (in Properties dialog)
   - Go to "General" tab
   - Check "Run whether user is logged on or not"
   - Check "Run with highest privileges"
   - Go to "Conditions" tab
   - Uncheck "Start the task only if computer is on AC power"
   - Click OK

#### Option B: Using PowerShell (Advanced)

```powershell
# Run PowerShell as Administrator
$action = New-ScheduledTaskAction -Execute "C:\Users\jerem\Documents\Projects\automated_tech_newsletter\automated_tech_newsletter\run_daily.bat" -WorkingDirectory "C:\Users\jerem\Documents\Projects\automated_tech_newsletter\automated_tech_newsletter"

$trigger = New-ScheduledTaskTrigger -Daily -At 7am

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "Tech Digest Daily" -Action $action -Trigger $trigger -Settings $settings -Description "Generate daily tech newsletter"
```

### 4. Verify Task Scheduler

```powershell
# Check if task exists
Get-ScheduledTask -TaskName "Tech Digest Daily"

# Run task manually to test
Start-ScheduledTask -TaskName "Tech Digest Daily"

# Check logs
type logs\cron.log
```

---

## Starting Web App Automatically on Windows Startup

### Option 1: Task Scheduler (Run at Login)

1. Open Task Scheduler
2. Create Basic Task
   - Name: `Tech Digest Web App`
   - Trigger: "When I log on"
   - Action: Start `start_webapp.bat`

### Option 2: Startup Folder

1. Press `Win + R`
2. Type: `shell:startup`
3. Create shortcut to `start_webapp.bat` in this folder

### Option 3: Windows Service (Advanced)

Use NSSM (Non-Sucking Service Manager):

```powershell
# Download NSSM from https://nssm.cc/download
# Extract and run:
nssm install TechDigestWebApp "C:\Users\jerem\Documents\Projects\automated_tech_newsletter\automated_tech_newsletter\venv\Scripts\python.exe" "C:\Users\jerem\Documents\Projects\automated_tech_newsletter\automated_tech_newsletter\webapp\app.py"
nssm start TechDigestWebApp
```

---

## Manual Commands

```powershell
# Generate digest
python main.py

# Start web app (development)
python webapp\app.py

# Start web app (production script)
.\start_webapp.bat

# Test daily script
.\run_daily.bat

# View logs
type logs\cron.log
type logs\access.log
type logs\error.log

# Manage scheduled task
Get-ScheduledTask -TaskName "Tech Digest Daily"
Start-ScheduledTask -TaskName "Tech Digest Daily"
Stop-ScheduledTask -TaskName "Tech Digest Daily"
Disable-ScheduledTask -TaskName "Tech Digest Daily"
Enable-ScheduledTask -TaskName "Tech Digest Daily"
```

---

## Troubleshooting

### Task not running?
```powershell
# Check task history
Get-ScheduledTask -TaskName "Tech Digest Daily" | Get-ScheduledTaskInfo

# Check logs
type logs\cron.log

# Run manually
.\run_daily.bat
```

### Virtual environment issues?
```powershell
# Recreate venv
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Web app not starting?
```powershell
# Check if port is in use
netstat -ano | findstr :8080

# Try different port
set PORT=8081
python webapp\app.py
```

---

## Files You Need (Windows)

✅ **Keep these:**
- `run_daily.bat` - Daily execution
- `setup.bat` - Initial setup
- `start_webapp.bat` - Web app launcher
- `WINDOWS_SETUP.md` - This file
- All Python files and `requirements.txt`

❌ **Remove these (Linux only):**
- `run_daily.sh`
- `setup.sh`
- `install_cron.sh`
- `start_webapp.sh`
- `tech-digest.service`

You can keep them if you plan to deploy on Linux later, or delete to reduce clutter.