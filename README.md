# Automated Tech Newsletter

Daily tech digest featuring **Gemini** news + **Hacker News** posts + **arXiv papers** summarized with **Hugging Face**, displayed in a unified scrollable web app with automated daily updates.

## 🎥 Demo

Watch the app in action: **[YouTube Demo](https://youtu.be/lipe5n8Pvzk)**

---

## ✨ Features

- 🌍 **World Tech News** → Gemini fetches and summarizes latest tech news
- 💬 **Hacker News** → Top posts summarized via Hugging Face API
- 📚 **Research Papers** → Latest AI/ML papers from arXiv with summaries
- 🗂️ **Daily HTML Archives** → Saved under `/archive/YYYY-MM-DD.html`
- 🌐 **Single-Page Web App** → All digests stacked chronologically (newest first)
- ⏰ **Automated Daily Execution** → Runs at 7 AM CET automatically
- 🚀 **Cross-Platform** → Works on Windows and Linux

---

## 🚀 Quick Start

### Windows Setup

```powershell
# 1. Clone and setup
git clone <your-repo>
cd automated_tech_newsletter
.\setup.bat

# 2. Configure API keys
notepad .env
# Add your GEMINI_API_KEY and HF_API_KEY

# 3. Test
python main.py

# 4. Start web app
python webapp\app.py
# Visit http://localhost:8080

# 5. Setup daily automation (see WINDOWS_SETUP.md)
```

### Linux/Mac Setup

```bash
# 1. Clone and setup
git clone <your-repo>
cd automated_tech_newsletter
chmod +x setup.sh
./setup.sh

# 2. Configure API keys
nano .env
# Add your GEMINI_API_KEY and HF_API_KEY

# 3. Test
python main.py

# 4. Start web app
python webapp/app.py
# Visit http://localhost:8080

# 5. Setup daily automation
./install_cron.sh
```

---

## 🔑 API Keys Required

### Gemini API

1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env`: `GEMINI_API_KEY=your_key_here`

### Hugging Face API

1. Visit https://huggingface.co/settings/tokens
2. Create access token
3. Add to `.env`: `HF_API_KEY=your_key_here`

---

## 🎨 Web App Overview

The web app displays **all daily digests in one continuous scrollable page**:

- ✅ All days stacked vertically (newest first)
- ✅ Date headers separate each day
- ✅ Smooth scrolling with animations
- ✅ Back-to-top button
- ✅ Fully responsive design
- ✅ Auto-updates when new digests are generated

---

## ⏰ Daily Automation

### Windows (Task Scheduler)

See **WINDOWS_SETUP.md** for complete instructions. Quick version:

1. Open Task Scheduler (`Win + R` → `taskschd.msc`)
2. Create Basic Task → Name: "Tech Digest Daily"
3. Trigger: Daily at 7:00 AM
4. Action: Start program → Browse to `run_daily.bat`
5. Done! ✅

### Linux (Cron)

```bash
# Install cron job (runs at 7 AM CET = 6 AM UTC)
./install_cron.sh

# Verify
crontab -l

# Check logs
tail -f logs/cron.log
```

---

## 📁 Project Structure

```
automated_tech_newsletter/
├── main.py                    # Main pipeline orchestrator
├── requirements.txt           # Python dependencies
│
├── Windows Files:
├── setup.bat                  # Windows setup
├── run_daily.bat             # Windows daily execution
├── start_webapp.bat          # Windows web app launcher
├── WINDOWS_SETUP.md          # Windows instructions
│
├── Linux Files:
├── setup.sh                  # Linux setup
├── run_daily.sh             # Linux daily execution
├── install_cron.sh          # Cron installation
├── start_webapp.sh          # Linux web app launcher
├── tech-digest.service      # Systemd service
│
├── .env                     # API keys (create from setup)
├── .gitignore              # Git ignore rules
│
├── src/
│   ├── collectors/         # Data fetching
│   │   ├── gemini_news.py  # Gemini tech news
│   │   ├── hackernews.py   # HN posts
│   │   └── arxiv.py        # Research papers
│   ├── summarizers/
│   │   └── huggingface_summarizer.py  # AI summarization
│   ├── generators/
│   │   └── html_generator.py  # HTML generation
│   └── utils/
│       ├── config.py       # Configuration
│       └── helpers.py      # Utilities
│
├── webapp/                 # Web application
│   ├── app.py             # Flask server
│   ├── templates/
│   │   └── index.html     # Unified scroll view
│   └── static/
│       └── style.css      # Styling
│
├── archive/               # Generated digests
│   └── YYYY-MM-DD.html   # Daily HTML files
│
└── logs/                 # Logs
    ├── cron.log         # Daily execution logs
    ├── access.log       # Web requests
    └── error.log        # Web errors
```

---

## ⚙️ Configuration (.env)

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your_huggingface_api_key_here

# Optional
MAX_ARTICLES_PER_SOURCE=3     # Articles per source
ARCHIVE_DIR=archive            # Archive folder
PORT=8080                      # Web app port
```

---

## 🔧 Common Commands

### Windows

```powershell
# Generate digest
python main.py

# Start web app (dev)
python webapp\app.py

# Start web app (production)
.\start_webapp.bat

# Test daily script
.\run_daily.bat

# View logs
type logs\cron.log
type logs\error.log
```

### Linux

```bash
# Generate digest
python main.py

# Start web app (dev)
python webapp/app.py

# Start web app (production)
./start_webapp.sh

# Test daily script
./run_daily.sh

# View logs
tail -f logs/cron.log
tail -f logs/error.log
```

---

## 🖥️ Production Deployment (GCP Free Tier)

Complete setup for running on Google Cloud:

```bash
# 1. Create VM
gcloud compute instances create tech-digest \
    --machine-type=e2-micro \
    --zone=us-central1-a \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud

# 2. SSH and clone
gcloud compute ssh tech-digest
git clone <your-repo>
cd automated_tech_newsletter

# 3. Setup
./setup.sh
nano .env  # Add API keys

# 4. Install systemd service
sudo nano tech-digest.service  # Update paths
sudo cp tech-digest.service /etc/systemd/system/
sudo systemctl enable tech-digest
sudo systemctl start tech-digest

# 5. Install cron
./install_cron.sh

# 6. Configure firewall
gcloud compute firewall-rules create allow-tech-digest \
    --allow=tcp:8080 \
    --source-ranges=0.0.0.0/0

# 7. Get IP and visit
gcloud compute instances describe tech-digest \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

---

## 🛠️ Troubleshooting

### Pipeline fails?

```bash
# Check logs
tail -50 logs/cron.log  # or: type logs\cron.log on Windows

# Test manually
python main.py

# Verify API keys
cat .env  # or: type .env on Windows
```

### Web app won't start?

```bash
# Check if port is in use
# Linux: netstat -tulpn | grep 8080
# Windows: netstat -ano | findstr :8080

# Try different port
set PORT=8081  # Windows
export PORT=8081  # Linux
python webapp/app.py
```

### Automation not working?

**Windows:**

```powershell
Get-ScheduledTask -TaskName "Tech Digest Daily"
Start-ScheduledTask -TaskName "Tech Digest Daily"
type logs\cron.log
```

**Linux:**

```bash
crontab -l
tail logs/cron.log
./run_daily.sh  # Test manually
```

### Empty web app?

```bash
# Generate test digest
python main.py

# Check archives exist
ls archive/  # or: dir archive on Windows

# Refresh browser
```

---

## 📊 Customization

### Change schedule

**Windows:** Edit Task Scheduler task time  
**Linux:** Edit `install_cron.sh`, change `CRON_SCHEDULE="0 6 * * *"`, then reinstall

### Change article count

Edit `.env`:

```bash
MAX_ARTICLES_PER_SOURCE=5
```

### Customize Gemini prompt

Edit `src/collectors/gemini_news.py` line ~29

### Change summarization model

Edit `src/utils/config.py` line ~23

---

## 🎯 Platform-Specific Files

### Keep for Windows Only

- `setup.bat`
- `run_daily.bat`
- `start_webapp.bat`
- `WINDOWS_SETUP.md`

### Keep for Linux Only

- `setup.sh`
- `run_daily.sh`
- `install_cron.sh`
- `start_webapp.sh`
- `tech-digest.service`

### Keep for Both Platforms

- All Python files (`main.py`, `src/`, `webapp/`)
- `requirements.txt`
- `.env` (create from setup)
- `.gitignore`
- `README.md`

---

## 📝 License

MIT License - Free to use and modify!

---

## 🤝 Support

**Having issues?**

1. Check the Troubleshooting section above
2. Review platform-specific guide (WINDOWS_SETUP.md or SETUP_GUIDE.md)
3. Check logs in `logs/` directory
4. Open a GitHub issue

---

## 🎉 Quick Test Checklist

After setup, verify everything works:

- [ ] `python main.py` generates HTML in `archive/`
- [ ] `python webapp/app.py` starts web server
- [ ] Visit http://localhost:8080 shows digest(s)
- [ ] Daily automation runs (check logs next day)
- [ ] New digests appear in web app automatically

**That's it! Enjoy your automated tech digest!** 🚀
