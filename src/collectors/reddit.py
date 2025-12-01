"""
Reddit collector - fetches top posts from specified subreddits.
"""

import requests
from typing import List, Dict
from ..utils.helpers import get_logger
from ..utils.config import (
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_USER_AGENT,
    REDDIT_SUBREDDITS,
    MAX_ARTICLES_PER_SOURCE
)

logger = get_logger(__name__)

AUTH_URL = "https://www.reddit.com/api/v1/access_token"
BASE_URL = "https://oauth.reddit.com"

def get_reddit_token() -> str:
    """Authenticate with Reddit and return OAuth token."""
    try:
        auth = requests.auth.HTTPBasicAuth(REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
        data = {"grant_type": "client_credentials"}
        headers = {"User-Agent": REDDIT_USER_AGENT}

        res = requests.post(AUTH_URL, auth=auth, data=data, headers=headers)
        res.raise_for_status()
        return res.json()["access_token"]
    except Exception as e:
        logger.error(f"Error authenticating with Reddit: {e}")
        return None

def fetch_top_posts(limit=MAX_ARTICLES_PER_SOURCE) -> List[Dict]:
    """Fetch top daily posts from all configured subreddits."""
    token = get_reddit_token()
    if not token:
        return []

    headers = {
        "Authorization": f"bearer {token}",
        "User-Agent": REDDIT_USER_AGENT
    }

    posts = []
    subreddits = REDDIT_SUBREDDITS.split(",")

    for sub in subreddits:
        try:
            url = f"{BASE_URL}/r/{sub}/top"
            params = {"t": "day", "limit": limit}

            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()

            for item in response.json()["data"]["children"]:
                data = item["data"]
                posts.append({
                    "title": data["title"],
                    "url": f"https://reddit.com{data['permalink']}",
                    "score": data["score"],
                    "comments_url": f"https://reddit.com{data['permalink']}",
                    "source": f"r/{sub}"
                })
        except Exception as e:
            logger.error(f"Error fetching subreddit r/{sub}: {e}")

    logger.info(f"Fetched {len(posts)} posts from Reddit")
    return posts[:limit]
