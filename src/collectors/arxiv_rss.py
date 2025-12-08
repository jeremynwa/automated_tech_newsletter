"""
arXiv collector using RSS feed (more reliable, less rate limiting)
"""

import feedparser
import time
from typing import List, Dict
from ..utils.helpers import get_logger, truncate_text
from ..utils.config import MAX_ARTICLES_PER_SOURCE

logger = get_logger(__name__)

# Use arXiv RSS feed instead (more reliable)
RSS_URLS = [
    "http://rss.arxiv.org/rss/cs.AI",
    "http://rss.arxiv.org/rss/cs.LG",
]

def fetch_latest_papers(limit=MAX_ARTICLES_PER_SOURCE) -> List[Dict]:
    """Fetch recent AI/ML papers from arXiv RSS feeds."""
    all_papers = []
    
    try:
        for rss_url in RSS_URLS:
            try:
                logger.info(f"Fetching from arXiv RSS: {rss_url}")
                time.sleep(2)  # Be nice to the API
                
                feed = feedparser.parse(rss_url)
                
                if not feed.entries:
                    logger.warning(f"No entries from {rss_url}")
                    continue
                
                for entry in feed.entries:
                    # Extract abstract from description
                    description = entry.get('description', '') or entry.get('summary', '')
                    
                    all_papers.append({
                        "title": entry.title.replace('\n', ' ').strip(),
                        "url": entry.link,
                        "summary": "",  # Will be filled by summarizer
                        "abstract": truncate_text(description.replace('\n', ' ').strip(), 2000),
                        "authors": [entry.author] if hasattr(entry, 'author') else [],
                        "published": entry.published if hasattr(entry, 'published') else "",
                        "source": "arXiv"
                    })
                
                logger.info(f"✓ Fetched {len(feed.entries)} papers from {rss_url}")
                
            except Exception as e:
                logger.error(f"Error fetching from {rss_url}: {e}")
                continue
        
        # Remove duplicates and limit
        seen_urls = set()
        unique_papers = []
        for paper in all_papers:
            if paper['url'] not in seen_urls:
                seen_urls.add(paper['url'])
                unique_papers.append(paper)
                if len(unique_papers) >= limit:
                    break
        
        logger.info(f"✓ Total unique papers fetched: {len(unique_papers)}")
        return unique_papers[:limit]
        
    except Exception as e:
        logger.error(f"Error fetching arXiv papers: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return []