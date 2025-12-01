"""
Groq summarizer - uses Groq API to summarize content.
"""

from groq import Groq
from typing import List, Dict
from ..utils.helpers import get_logger, truncate_text
from ..utils.config import GROQ_API_KEY, GROQ_MODEL

logger = get_logger(__name__)

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)


def summarize_article(article: Dict) -> Dict:
    """Summarize a single article using Groq."""
    try:
        # Determine what content to summarize
        if 'abstract' in article:
            # For arXiv papers
            content_to_summarize = f"Title: {article['title']}\n\nAbstract: {article['abstract']}"
        else:
            # For HN/Reddit posts (no full content)
            content_to_summarize = f"Title: {article['title']}"

        prompt = f"""
Summarize this tech article/post in 2–3 concise sentences. Focus on the key takeaway.

{content_to_summarize}

Summary:
        """

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=150
        )

        article['summary'] = response.choices[0].message.content.strip()
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
    """Summarize multiple articles using Groq."""
    summarized = []
    for article in articles:
        summarized.append(summarize_article(article))

    logger.info(f"Summarized {len(summarized)} articles with Groq")
    return summarized
