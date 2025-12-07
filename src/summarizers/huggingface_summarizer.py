# src/summarizers/huggingface_summarizer.py

import os
import time
import logging
from typing import List, Dict
from openai import OpenAI

from ..utils.helpers import get_logger, truncate_text

logger = get_logger(__name__)

# Initialize Hugging Face client using OpenAI SDK
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_API_KEY") or os.getenv("HF_TOKEN"),  # Support both env var names
)


def _hf_summarize(text: str, title: str = "") -> str:
    """
    Summarize text using Hugging Face via OpenAI SDK interface.
    """
    try:
        prompt = f"""Summarize this article in a clear, accessible way for someone who isn't an expert.

Article Title: {title}

Content:
{text}

Provide your summary in this format:

Summary: <2-3 sentences explaining what this is about>

Why This Matters:
• <first key point explained simply>
• <second key point explained simply>
• <third key point if relevant>

Keep it concise and use simple language. Focus on practical implications."""

        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct",  # Good free model
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        summary = completion.choices[0].message.content
        return summary.strip()
        
    except Exception as e:
        logger.error(f"HF summarization error: {e}")
        raise


def summarize_article(article: Dict) -> Dict:
    """
    Summarize a single article with enhanced formatting.
    """
    # Choose best textual content available
    if article.get("content"):
        content = truncate_text(article["content"], 2500)
    elif article.get("abstract"):
        content = article["abstract"][:2000]
    else:
        content = article.get("title", "")

    if not content or len(content) < 50:
        article["summary"] = article.get("title", "No content available")
        return article

    try:
        title = article.get('title', 'Untitled')
        summary = _hf_summarize(content, title)
        
        # Clean up the response if it starts with "Summary:"
        if summary.startswith("Summary:"):
            summary = summary[8:].strip()
        
        article["summary"] = summary
        logger.info(f"✓ Summarized: {title[:60]}")
        
    except Exception as e:
        logger.error(f"Failed to summarize '{article.get('title', '')[:60]}': {e}")
        # Fallback: use truncated content
        article["summary"] = truncate_text(content, 300)
        article["_summary_fallback"] = "truncated"
    
    return article


def summarize_articles(articles: List[Dict]) -> List[Dict]:
    """
    Summarize a list of articles using Hugging Face API.
    """
    summarized = []
    for i, article in enumerate(articles):
        logger.info(f"Summarizing article {i+1}/{len(articles)}: {article.get('title','')[:60]}")
        summarized.append(summarize_article(article))
        
        # Rate limiting delay
        if i < len(articles) - 1:
            time.sleep(1)
    
    logger.info(f"Summarized {len(summarized)} articles with Hugging Face.")
    return summarized