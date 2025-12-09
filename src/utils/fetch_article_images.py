"""
Utility to fetch Open Graph images from article URLs
Add this to src/utils/fetch_article_images.py
"""

import requests
from bs4 import BeautifulSoup
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def fetch_article_image(url: str, timeout: int = 5) -> Optional[str]:
    """
    Fetch Open Graph image from article URL.
    
    Args:
        url: Article URL
        timeout: Request timeout in seconds
    
    Returns:
        Image URL or None if not found
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try Open Graph image
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content']
        
        # Try Twitter card image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            return twitter_image['content']
        
        # Try first img tag as fallback
        first_img = soup.find('img')
        if first_img and first_img.get('src'):
            img_url = first_img['src']
            # Make absolute URL if relative
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            elif img_url.startswith('/'):
                from urllib.parse import urlparse
                parsed = urlparse(url)
                img_url = f"{parsed.scheme}://{parsed.netloc}{img_url}"
            return img_url
        
        return None
        
    except Exception as e:
        logger.debug(f"Could not fetch image for {url}: {e}")
        return None


def add_images_to_articles(articles: list, max_workers: int = 5) -> list:
    """
    Add image URLs to articles using concurrent fetching.
    
    Args:
        articles: List of article dicts with 'url' key
        max_workers: Maximum concurrent requests
    
    Returns:
        Articles list with 'image_url' added
    """
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    def fetch_with_index(idx_article):
        idx, article = idx_article
        url = article.get('url')
        if url and url != '#':
            image_url = fetch_article_image(url)
            return idx, image_url
        return idx, None
    
    # Fetch images concurrently
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fetch_with_index, (i, article)): i 
            for i, article in enumerate(articles)
        }
        
        for future in as_completed(futures):
            try:
                idx, image_url = future.result()
                articles[idx]['image_url'] = image_url
            except Exception as e:
                logger.error(f"Error fetching image: {e}")
    
    return articles