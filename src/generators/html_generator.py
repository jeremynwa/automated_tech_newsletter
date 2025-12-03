"""
HTML generator - builds daily digest HTML from collected and summarized content.
"""

from typing import List, Dict
from datetime import datetime
from ..utils.helpers import get_logger

logger = get_logger(__name__)

def generate_daily_html(
    gemini_news: List[Dict],
    hn_posts: List[Dict],
    papers: List[Dict],
    date: str = None
) -> str:
    """
    Generate HTML digest for the day.
    
    Args:
        gemini_news: List of Gemini news articles (already summarized)
        hn_posts: List of HN posts (with summaries)
        papers: List of arXiv papers (with summaries)
        date: Date string (YYYY-MM-DD), defaults to today
    
    Returns:
        Complete HTML string
    """
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Digest - {date}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
        }}
        .header .date {{
            font-size: 1.2em;
            opacity: 0.9;
            margin-top: 10px;
        }}
        .section {{
            background: white;
            padding: 25px;
            margin-bottom: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }}
        .section h2 {{
            color: #667eea;
            margin-top: 0;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }}
        .article {{
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }}
        .article:last-child {{
            border-bottom: none;
        }}
        .article-title {{
            font-size: 1.3em;
            font-weight: 600;
            margin-bottom: 8px;
        }}
        .article-title a {{
            color: #333;
            text-decoration: none;
        }}
        .article-title a:hover {{
            color: #667eea;
        }}
        .article-meta {{
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
        }}
        .article-summary {{
            line-height: 1.6;
            color: #444;
        }}
        .authors {{
            color: #888;
            font-size: 0.9em;
            margin-top: 5px;
        }}
        .links {{
            margin-top: 10px;
        }}
        .links a {{
            color: #667eea;
            text-decoration: none;
            margin-right: 15px;
            font-size: 0.9em;
        }}
        .links a:hover {{
            text-decoration: underline;
        }}
        .emoji {{
            margin-right: 8px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Tech Digest</h1>
        <div class="date">{date}</div>
    </div>
"""
    
    # World Tech News (Gemini)
    if gemini_news:
        html += generate_section(
            title="🌍 World Tech News",
            articles=gemini_news,
            show_summary=True
        )
    
    # Community Tech News - Hacker News
    if hn_posts:
        html += generate_section(
            title="🔥 Hacker News",
            articles=hn_posts,
            show_summary=True,
            show_score=True,
            show_comments=True
        )
    
    # Research Papers
    if papers:
        html += generate_section(
            title="📚 Research Papers",
            articles=papers,
            show_summary=True,
            show_authors=True
        )
    
    html += """
</body>
</html>
"""
    
    logger.info(f"Generated HTML digest for {date}")
    return html

def generate_section(
    title: str,
    articles: List[Dict],
    show_summary: bool = False,
    show_score: bool = False,
    show_comments: bool = False,
    show_authors: bool = False
) -> str:
    """
    Generate HTML section for a category.
    
    Args:
        title: Section title
        articles: List of article dicts
        show_summary: Whether to show summary
        show_score: Whether to show score (HN)
        show_comments: Whether to show comments link
        show_authors: Whether to show authors (papers)
    
    Returns:
        HTML string for the section
    """
    html = f'<div class="section"><h2>{title}</h2>\n'
    
    for article in articles:
        html += '<div class="article">\n'
        
        # Title
        article_title = article.get('title', 'No title')
        article_url = article.get('url', '#')
        html += f'<div class="article-title"><a href="{article_url}" target="_blank">{article_title}</a></div>\n'
        
        # Meta info
        meta_parts = []
        if show_score and 'score' in article:
            meta_parts.append(f"⬆️ {article['score']} points")
        if 'source' in article:
            meta_parts.append(f"📰 {article['source']}")
        if 'published' in article:
            meta_parts.append(f"📅 {article['published']}")
        
        if meta_parts:
            html += f'<div class="article-meta">{" • ".join(meta_parts)}</div>\n'
        
        # Authors (for papers)
        if show_authors and 'authors' in article:
            authors = article['authors'][:3]  # Show first 3 authors
            authors_str = ', '.join(authors)
            if len(article['authors']) > 3:
                authors_str += f" et al. ({len(article['authors'])} total)"
            html += f'<div class="authors">👥 {authors_str}</div>\n'
        
        # Summary
        if show_summary and 'summary' in article:
            html += f'<div class="article-summary">{article["summary"]}</div>\n'
        
        # Links
        links = []
        if 'url' in article:
            links.append(f'<a href="{article["url"]}" target="_blank">Read More</a>')
        if show_comments and 'comments_url' in article:
            links.append(f'<a href="{article["comments_url"]}" target="_blank">Comments</a>')
        
        if links:
            html += f'<div class="links">{" ".join(links)}</div>\n'
        
        html += '</div>\n'
    
    html += '</div>\n'
    return html