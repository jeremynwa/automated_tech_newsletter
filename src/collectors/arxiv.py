"""
arXiv collector - fetches most recent AI/ML papers.
"""

import feedparser
from typing import List, Dict
from ..utils.helpers import get_logger, truncate_text
from ..utils.config import MAX_ARTICLES_PER_SOURCE

logger = get_logger(__name__)

ARXIV_QUERY = "cat:cs.AI+OR+cat:cs.LG"
ARXIV_URL = f"http://export.arxiv.org/api/query?search_query={ARXIV_QUERY}&sortBy=submittedDate&sortOrder=descending&max_results={MAX_ARTICLES_PER_SOURCE}"

def fetch_latest_papers(limit=MAX_ARTICLES_PER_SOURCE) -> List[Dict]:
    """Fetch recent AI/ML papers from arXiv."""
    try:
        feed = feedparser.parse(ARXIV_URL)
        papers = []

        for entry in feed.entries[:limit]:
            papers.append({
                "title": entry.title,
                "url": entry.link,
                "summary": "",  # Will be filled by Groq later
                "abstract": truncate_text(entry.summary, 2000),
                "authors": [author.name for author in entry.authors],
                "published": entry.published,
                "source": "arXiv"
            })

        logger.info(f"Fetched {len(papers)} arXiv papers")
        return papers

    except Exception as e:
        logger.error(f"Error fetching arXiv papers: {e}")
        return []
