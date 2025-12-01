"""
Helper utilities for date formatting, file I/O, and common functions.
"""

from datetime import datetime
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def get_logger(name):
    """Get a logger instance"""
    return logging.getLogger(name)

def get_today_date():
    """Returns today's date as YYYY-MM-DD string"""
    return datetime.now().strftime('%Y-%m-%d')

def get_archive_path(archive_dir, date=None):
    """
    Get path for archive HTML file.
    
    Args:
        archive_dir: Path to archive directory
        date: Date string (YYYY-MM-DD), defaults to today
    
    Returns:
        Path object for the archive file
    """
    if date is None:
        date = get_today_date()
    
    return Path(archive_dir) / f"{date}.html"

def save_html(content, filepath):
    """
    Save HTML content to file.
    
    Args:
        content: HTML string to save
        filepath: Path object or string
    """
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    logger = get_logger(__name__)
    logger.info(f"Saved HTML to {filepath}")

def truncate_text(text, max_length=500):
    """
    Truncate text to max_length, adding ellipsis if needed.
    
    Args:
        text: String to truncate
        max_length: Maximum length
    
    Returns:
        Truncated string
    """
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."