"""
Gemini news collector - fetches and summarizes world tech news using Gemini.
Note: Gemini does both fetching AND summarizing in one step.
"""

import google.generativeai as genai
from typing import List, Dict
from ..utils.helpers import get_logger
from ..utils.config import GEMINI_API_KEY, MAX_ARTICLES_PER_SOURCE

logger = get_logger(__name__)

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

def fetch_and_summarize_news(limit=MAX_ARTICLES_PER_SOURCE) -> List[Dict]:
    """
    Fetch and summarize top tech news using Gemini.
    
    Note: This function returns already-summarized content.
    The 'summary' field will contain Gemini's summary.
    
    Args:
        limit: Number of news articles to fetch
    
    Returns:
        List of dicts with keys: title, url, summary, source
    """
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Prompt Gemini to fetch and summarize news
        # USER: ADD YOUR CUSTOM PROMPT HERE
        prompt = f"""Find the top {limit} most important tech news stories from today.
For each story, provide:
1. Title
2. Source URL
3. A 2-3 sentence summary

Format your response as a list with clear separation between articles.
Use this format:
---
Title: [title]
URL: [url]
Summary: [summary]
---"""

        response = model.generate_content(prompt)
        
        # Parse Gemini's response
        articles = parse_gemini_response(response.text)
        
        logger.info(f"Fetched and summarized {len(articles)} news articles via Gemini")
        return articles[:limit]
    
    except Exception as e:
        logger.error(f"Error fetching news with Gemini: {e}")
        return []

def parse_gemini_response(text: str) -> List[Dict]:
    """
    Parse Gemini's formatted response into structured data.
    
    Args:
        text: Raw text from Gemini
    
    Returns:
        List of article dicts
    """
    articles = []
    
    # Split by separator
    blocks = text.split('---')
    
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        
        article = {
            'title': '',
            'url': '',
            'summary': '',
            'source': 'Gemini News'
        }
        
        # Parse each line
        for line in block.split('\n'):
            line = line.strip()
            if line.startswith('Title:'):
                article['title'] = line.replace('Title:', '').strip()
            elif line.startswith('URL:'):
                article['url'] = line.replace('URL:', '').strip()
            elif line.startswith('Summary:'):
                article['summary'] = line.replace('Summary:', '').strip()
        
        # Only add if we have at least title and summary
        if article['title'] and article['summary']:
            articles.append(article)
    
    return articles