"""
Configuration loader for the tech newsletter system.
Loads environment variables and provides centralized config access.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
project_root = Path(__file__).parent.parent.parent
load_dotenv(project_root / '.env')

# API Keys
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Reddit API
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'TechNewsBot/1.0')
REDDIT_SUBREDDITS = os.getenv('REDDIT_SUBREDDITS', 'technology')

# Settings
MAX_ARTICLES_PER_SOURCE = int(os.getenv('MAX_ARTICLES_PER_SOURCE', '3'))
ARCHIVE_DIR = Path(project_root) / os.getenv('ARCHIVE_DIR', 'archive')

# Ensure archive directory exists
ARCHIVE_DIR.mkdir(exist_ok=True)

# Hugging Face configuration
HF_MODEL = "facebook/bart-large-cnn"  # Free summarization model
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

# Validation
def validate_config():
    """Check if required API keys are present"""
    missing = []
    
    if not GEMINI_API_KEY:
        missing.append('GEMINI_API_KEY')
    if not REDDIT_CLIENT_ID:
        missing.append('REDDIT_CLIENT_ID')
    if not REDDIT_CLIENT_SECRET:
        missing.append('REDDIT_CLIENT_SECRET')
    
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    return True