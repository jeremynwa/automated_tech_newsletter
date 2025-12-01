"""
Configuration loader + environment validation.
"""

import os
from dotenv import load_dotenv
from ..utils.helpers import get_logger

load_dotenv()
logger = get_logger(__name__)

# Required keys
REQUIRED_KEYS = [
    "GEMINI_API_KEY",
    "GROQ_API_KEY",
    "REDDIT_CLIENT_ID",
    "REDDIT_CLIENT_SECRET",
]

# Base Settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192")

MAX_ARTICLES_PER_SOURCE = int(os.getenv("MAX_ARTICLES_PER_SOURCE", 3))

# Reddit
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "techdigest-app/1.0")
REDDIT_SUBREDDITS = os.getenv("REDDIT_SUBREDDITS", "technology,programming,MachineLearning")

# Archive
ARCHIVE_DIR = os.getenv("ARCHIVE_DIR", "archive")

def validate_config():
    """Ensure all required environment variables are present."""
    missing = [key for key in REQUIRED_KEYS if not os.getenv(key)]

    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

    logger.info("Environment variables validated successfully")
