"""
arXiv collector - fetches most recent AI/ML papers.
"""

import feedparser
import time
from typing import List, Dict
from ..utils.helpers import get_logger, truncate_text
from ..utils.config import MAX_ARTICLES_PER_SOURCE

logger = get_logger(__name__)

# Updated query with better formatting
ARXIV_QUERY = "cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV"
ARXIV_URL = f"http://export.arxiv.org/api/query?search_query={ARXIV_QUERY}&sortBy=submittedDate&sortOrder=descending&max_results={MAX_ARTICLES_PER_SOURCE * 2}"

def fetch_latest_papers(limit=MAX_ARTICLES_PER_SOURCE) -> List[Dict]:
    """Fetch recent AI/ML papers from arXiv."""
    try:
        logger.info(f"Fetching from arXiv with URL: {ARXIV_URL}")
        
        # Add a small delay to avoid rate limiting
        time.sleep(1)
        
        feed = feedparser.parse(ARXIV_URL)
        
        # Check for errors
        if hasattr(feed, 'bozo') and feed.bozo:
            logger.error(f"arXiv feed parsing error: {feed.bozo_exception}")
        
        # Check if we got any entries
        if not feed.entries:
            logger.warning("No entries returned from arXiv API")
            logger.warning(f"Feed keys: {feed.keys()}")
            if hasattr(feed, 'status'):
                logger.warning(f"HTTP Status: {feed.status}")
        
        papers = []

        for entry in feed.entries[:limit]:
            try:
                papers.append({
                    "title": entry.title,
                    "url": entry.link,
                    "summary": "",  # Will be filled by summarizer later
                    "abstract": truncate_text(entry.summary, 2000),
                    "authors": [author.name for author in entry.authors] if hasattr(entry, 'authors') else [],
                    "published": entry.published if hasattr(entry, 'published') else "",
                    "source": "arXiv"
                })
            except Exception as e:
                logger.error(f"Error processing arXiv entry: {e}")
                continue

        logger.info(f"Fetched {len(papers)} arXiv papers")
        return papers

    except Exception as e:
        logger.error(f"Error fetching arXiv papers: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return []