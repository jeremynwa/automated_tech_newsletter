import requests
from typing import List, Dict
from ..utils.helpers import get_logger, truncate_text
from ..utils.config import MAX_ARTICLES_PER_SOURCE

logger = get_logger(__name__)

HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ALGOLIA_ITEM_URL = "https://hn.algolia.com/api/v1/items/{}"

def fetch_top_stories(limit=MAX_ARTICLES_PER_SOURCE) -> List[Dict]:
    """
    Fetch top stories from Hacker News using Firebase API for IDs
    but Algolia API for full content.
    Returns stories with full text for better summarization.
    """

    try:
        # Get top story IDs
        response = requests.get(HN_TOP_STORIES_URL, timeout=10)
        response.raise_for_status()
        story_ids = response.json()[:limit]

        stories = []

        for story_id in story_ids:
            # Fetch full story details from Algolia
            algolia_url = HN_ALGOLIA_ITEM_URL.format(story_id)
            item_res = requests.get(algolia_url, timeout=10)
            item_res.raise_for_status()
            item = item_res.json()

            # Skip if nothing returned
            if not item:
                continue

            # Prefer story_text (Ask HN, Tell HN, etc.)
            content = item.get("story_text") or item.get("text") or ""

            # Fallback to combining comments if no body
            if not content and "children" in item:
                top_comments = []
                for c in item["children"][:3]:
                    if c.get("text"):
                        top_comments.append(c["text"])
                if top_comments:
                    content = "\n\n".join(top_comments)

            # Final fallback: use title only
            if not content:
                content = item.get("title", "")

            stories.append({
                "title": item.get("title", "No title"),
                "url": item.get("url") or f"https://news.ycombinator.com/item?id={story_id}",
                "score": item.get("points", 0),
                "comments_url": f"https://news.ycombinator.com/item?id={story_id}",
                "source": "Hacker News",
                "content": truncate_text(content, 5000)  # Limit for summarizer
            })

        logger.info(f"Fetched {len(stories)} Hacker News stories (Algolia Enhanced)")
        return stories[:limit]

    except Exception as e:
        logger.error(f"Error fetching Hacker News via Algolia: {e}")
        return []
