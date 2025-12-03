# Setup Guide

## Quick Start (Local Development)

```bash
# 1. Clone and setup
git clone <your-repo>
cd automated_tech_newsletter
chmod +x setup.sh
./setup.sh

# 2. Configure API keys
nano .env  # Add your API keys

# 3. Test the pipeline
python main.py

# 4. Start web app
python webapp/app.py
# Visit http://localhost:8080
```

## Getting API Keys

### Gemini (Required)

1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env`: `GEMINI_API_KEY=your_key`

### Reddit (Required)

1. Go to https://www.reddit.com/prefs/apps
2. Create app (select "script")
3. Add to `.env`:
   - `REDDIT_CLIENT_ID=...`
   - `REDDIT_CLIENT_SECRET=...`

**Note:** Summarization uses free Hugging Face Inference API (no signup needed!)

## Production Setup (GCP Free Tier VM)

### 1. Create GCP VM

```bash
# Create e2-micro instance (free tier)
gcloud compute instances create tech-digest \
    --machine-type=e2-micro \
    --zone=us-central1-a \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud
```

### 2. SSH and Setup

```bash
# SSH into VM
gcloud compute ssh tech-digest

# Install dependencies
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git

# Clone repo
git clone <your-repo>
cd automated_tech_newsletter

# Run setup
chmod +x setup.sh
./setup.sh

# Configure .env
nano .env
```

### 3. Install Cron Job

```bash
chmod +x install_cron.sh
./install_cron.sh
```

### 4. Setup Web App Service

```bash
# Edit service file with your username and paths
nano tech-digest.service

# Install service
sudo cp tech-digest.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tech-digest
sudo systemctl start tech-digest

# Check status
sudo systemctl status tech-digest
```

### 5. Configure Firewall

```bash
# Allow port 8080
gcloud compute firewall-rules create allow-tech-digest \
    --allow=tcp:8080 \
    --source-ranges=0.0.0.0/0 \
    --description="Allow access to tech digest webapp"
```

### 6. Access Your App

```bash
# Get external IP
gcloud compute instances describe tech-digest --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Visit http://YOUR_IP:8080
```

## Manual Commands

```bash
# Generate today's digest
python main.py

# Start webapp (development)
python webapp/app.py

# Start webapp (production)
./start_webapp.sh

# View cron logs
tail -f logs/cron.log

# View webapp logs
tail -f logs/access.log
tail -f logs/error.log
```

## Customization

### Change Schedule

Edit `install_cron.sh` and modify:

```bash
CRON_SCHEDULE="0 8 * * *"  # Currently 8 AM daily
# Examples:
# "0 */6 * * *"  # Every 6 hours
# "0 0 * * *"    # Midnight daily
# "0 12 * * 1"   # Noon every Monday
```

### Change Number of Articles

Edit `.env`:

```bash
MAX_ARTICLES_PER_SOURCE=5  # Default is 3
```

### Change Subreddits

Edit `.env`:

```bash
REDDIT_SUBREDDITS=technology,programming,machinelearning,artificial
```

### Customize Gemini Prompt

Edit `src/collectors/gemini_news.py` line 29

## Troubleshooting

### Cron not running?

```bash
# Check cron logs
tail -f logs/cron.log

# Test manually
./run_daily.sh

# Check crontab
crontab -l
```

### Web app not accessible?

```bash
# Check if running
sudo systemctl status tech-digest

# Check logs
tail -f logs/error.log

# Restart service
sudo systemctl restart tech-digest
```

### API errors?

```bash
# Verify .env file
cat .env

# Test API keys
python -c "from src.utils.config import validate_config; validate_config()"
```

### Hugging Face taking too long?

```bash
# First run might take 10-20s per article as model loads
# Subsequent requests are faster
# If timeout issues, increase timeout in groq_summarizer.py line 46
```
