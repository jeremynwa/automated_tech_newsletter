"""
Groq summarizer - uses Groq API to summarize content.
"""

from src.summarizers.groq_summarizer import Groq
from typing import List, Dict
from utils.helpers import get_logger, truncate_text
from utils.config import GROQ_API_KEY, GROQ_MODEL

logger = get_logger(__name__)

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

def summarize_article(article: Dict) -> Dict:
    """
    Summarize a single article using Groq.
    
    Args:
        article: Dict with 'title', 'url', and optionally 'abstract' or text content
    
    Returns:
        Original article dict with added 'summary' field
    """
    try:
        # Determine what content to summarize
        content_to_summarize = ""
        
        if 'abstract' in article:
            # For arXiv papers
            content_to_summarize = f"Title: {article['title']}\n\nAbstract: {article['abstract']}"
        else:
            # For HN/Reddit posts (just use title since we don't fetch full content)
            content_to_summarize = f"Title: {article['title']}"
        
        # Create prompt
        prompt = f"""Summarize this tech article/post in 2-3 concise sentences. Focus on the key takeaway.

{content_to_summarize}

Summary:"""
        
        # Call Groq API
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=150
        )
        
        summary = response.choices[0].message.content.strip()
        article['summary'] = summary
        
        return article
    
    except Exception as e:
        logger.error(f"Error summarizing article '{article.get('title', 'Unknown')}': {e}")
        # Fallback to truncated title or abstract
        if 'abstract' in article:
            article['summary'] = truncate_text(article['abstract'], 200)
        else:
            article['summary'] = article['title']
        return article

def summarize_articles(articles: List[Dict]) -> List[Dict]:
    """
    Summarize multiple articles using Groq.
    
    Args:
        articles: List of article dicts
    
    Returns:
        List of articles with added 'summary' fields
    """
    summarized = []
    
    for article in articles:
        summarized_article = summarize_article(article)
        summarized.append(summarized_article)
    
    logger.info(f"Summarized {len(summarized)} articles with Groq")
    return summarized