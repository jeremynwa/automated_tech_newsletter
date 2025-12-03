"""
Hugging Face summarizer - uses HF Inference API to summarize content.
"""

import requests
import time
from typing import List, Dict
from ..utils.helpers import get_logger, truncate_text
from ..utils.config import HF_API_URL

logger = get_logger(__name__)

def query_huggingface(text: str, max_retries: int = 3) -> str:
    """
    Query Hugging Face Inference API with retry logic.
    
    Args:
        text: Text to summarize
        max_retries: Number of retries if model is loading
    
    Returns:
        Summary text
    """
    headers = {"Content-Type": "application/json"}
    payload = {
        "inputs": text,
        "parameters": {
            "max_length": 150,
            "min_length": 30,
            "do_sample": False
        }
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get('summary_text', text[:200])
                return text[:200]
            
            elif response.status_code == 503:
                # Model is loading, wait and retry
                logger.warning(f"Model loading, retrying in 10s... (attempt {attempt + 1}/{max_retries})")
                time.sleep(10)
                continue
            
            else:
                logger.error(f"HF API error: {response.status_code} - {response.text}")
                return text[:200]
        
        except Exception as e:
            logger.error(f"Error querying HF API: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
                continue
            return text[:200]
    
    # If all retries failed
    return text[:200]

def summarize_article(article: Dict) -> Dict:
    """
    Summarize a single article using Hugging Face.
    
    Args:
        article: Dict with 'title', 'url', and optionally 'abstract'
    
    Returns:
        Original article dict with added 'summary' field
    """
    try:
        # Determine what content to summarize
        if 'abstract' in article and article['abstract']:
            # For arXiv papers - use abstract
            content = article['abstract'][:1024]  # BART has 1024 token limit
        else:
            # For HN/Reddit - use title only (not ideal but we don't have full content)
            content = article['title']
        
        # Get summary from HF
        summary = query_huggingface(content)
        article['summary'] = summary
        
        return article
    
    except Exception as e:
        logger.error(f"Error summarizing article '{article.get('title', 'Unknown')}': {e}")
        # Fallback
        if 'abstract' in article:
            article['summary'] = truncate_text(article['abstract'], 200)
        else:
            article['summary'] = article['title']
        return article

def summarize_articles(articles: List[Dict]) -> List[Dict]:
    """
    Summarize multiple articles using Hugging Face.
    
    Args:
        articles: List of article dicts
    
    Returns:
        List of articles with added 'summary' fields
    """
    summarized = []
    
    for i, article in enumerate(articles):
        logger.info(f"Summarizing article {i+1}/{len(articles)}: {article.get('title', 'Unknown')[:50]}...")
        summarized_article = summarize_article(article)
        summarized.append(summarized_article)
        
        # Small delay to avoid rate limiting
        if i < len(articles) - 1:
            time.sleep(1)
    
    logger.info(f"Summarized {len(summarized)} articles with Hugging Face")
    return summarized