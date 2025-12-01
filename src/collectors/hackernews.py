"""
Hacker News collector - fetches top stories from HN API.
"""

import requests
from typing import List, Dict
from ..utils.helpers import get_logger
from ..utils.config import MAX_ARTICLES_PER_SOURCE

logger = get_logger(__name__)

HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{}.json"

def fetch_top_stories(limit=MAX_ARTICLES_PER_SOURCE) -> List[Dict]:
    """
    Fetch top stories from Hacker News.
    
    Args:
        limit: Number of stories to fetch
    
    Returns:
        List of dicts with keys: title, url, score, comments_url
    """
    try:
        # Get top story IDs
        response = requests.get(HN_TOP_STORIES_URL, timeout=10)
        response.raise_for_status()
        story_ids = response.json()[:limit]
        
        stories = []
        for story_id in story_ids:
            item_url = HN_ITEM_URL.format(story_id)
            item_response = requests.get(item_url, timeout=10)
            item_response.raise_for_status()
            item = item_response.json()
            
            # Only include stories with URLs (skip Ask HN, etc.)
            if item and item.get('url'):
                stories.append({
                    'title': item.get('title', 'No title'),
                    'url': item.get('url'),
                    'score': item.get('score', 0),
                    'comments_url': f"https://news.ycombinator.com/item?id={story_id}",
                    'source': 'Hacker News'
                })
        
        logger.info(f"Fetched {len(stories)} stories from Hacker News")
        return stories[:limit]
    
    except Exception as e:
        logger.error(f"Error fetching Hacker News: {e}")
        return []