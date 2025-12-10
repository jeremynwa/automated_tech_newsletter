"""
HTML Generator for Daily Tech Digest
"""

from typing import List, Dict
from datetime import datetime
from ..utils.helpers import get_logger

logger = get_logger(__name__)

# Dans src/generators/html_generator.py
# Remplacer la fin de la fonction generate_daily_html()

def generate_daily_html(
    gemini_news: List[Dict],
    hn_posts: List[Dict],
    papers: List[Dict],
    date: str = None
) -> str:
    """Generate HTML digest for the day."""
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
        
        /* Article images */
        .article-image-container {{
            width: 100%;
            margin-bottom: 1rem;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }}
        .article-image {{
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
        }}
        .article-image-container:hover .article-image {{
            transform: scale(1.05);
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
        .article-summary strong {{
            display: block;
            margin-top: 12px;
            margin-bottom: 8px;
            color: #1e293b;
        }}
        .article-summary ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .article-summary li {{
            margin-bottom: 8px;
        }}
        .authors {{
            color: #888;
            font-size: 0.9em;
            margin-top: 5px;
        }}
        .links {{
            margin-top: 10px;
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
        }}
        .links a {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 0.9em;
            font-weight: 600;
            transition: all 0.3s ease;
        }}
        .links a:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }}
        
        /* Share button */
        .share-container {{
            position: relative;
            display: inline-block;
        }}
        .share-button {{
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 8px 20px;
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            border-radius: 8px;
            font-size: 0.9em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }}
        .share-button:hover {{
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }}
        .share-menu {{
            position: absolute;
            bottom: 100%;
            right: 0;
            margin-bottom: 0.5rem;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s ease;
            z-index: 100;
            min-width: 160px;
            overflow: hidden;
        }}
        .share-menu.active {{
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }}
        .share-option {{
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            background: transparent;
            border: none;
            color: #333;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }}
        .share-option:last-child {{
            border-bottom: none;
        }}
        .share-option:hover {{
            background: #667eea;
            color: white;
        }}
        .share-icon {{
            font-size: 1.2rem;
        }}
        .share-option.copied {{
            background: #10b981;
            color: white;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Tech Digest</h1>
        <div class="date">{date}</div>
    </div>
"""
    
    # World Tech News (Gemini)
    if gemini_news:
        html += generate_section(
            title="World Tech News",
            articles=gemini_news,
            show_summary=True
        )
    
    # Community Tech News - Hacker News
    if hn_posts:
        html += generate_section(
            title="Hacker News",
            articles=hn_posts,
            show_summary=True,
            show_score=True,
            show_comments=True
        )
    
    # Research Papers
    if papers:
        html += generate_section(
            title="Research Papers",
            articles=papers,
            show_summary=True,
            show_authors=True
        )
    
    # PAS DE JAVASCRIPT INLINE ICI - utilise share.js à la place
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
    Generate HTML section for a category with images and share buttons.
    """
    html = f'<div class="section"><h2>{title}</h2>\n'
    
    for article in articles:
        html += '<div class="article">\n'
        
        # Article image (if available)
        if article.get('image_url'):
            article_url = article.get('url', '#')
            article_title_escaped = article.get('title', 'Article image').replace('"', '&quot;')
            html += f'''<div class="article-image-container">
                <a href="{article_url}" target="_blank">
                    <img src="{article['image_url']}" 
                         alt="{article_title_escaped}" 
                         class="article-image"
                         loading="lazy"
                         onerror="this.parentElement.parentElement.style.display='none'">
                </a>
            </div>\n'''
        
        # Title
        article_title = article.get('title', 'No title')
        article_url = article.get('url', '#')
        html += f'<div class="article-title"><a href="{article_url}" target="_blank">{article_title}</a></div>\n'
        
        # Meta info
        meta_parts = []
        if show_score and 'score' in article:
            meta_parts.append(f"{article['score']} points")
        if 'source' in article:
            meta_parts.append(f"{article['source']}")
        if 'published' in article:
            meta_parts.append(f"{article['published']}")
        
        if meta_parts:
            html += f'<div class="article-meta">{" • ".join(meta_parts)}</div>\n'
        
        # Authors (for papers)
        if show_authors and 'authors' in article:
            authors = article['authors'][:3]
            authors_str = ', '.join(authors)
            if len(article['authors']) > 3:
                authors_str += f" et al. ({len(article['authors'])} total)"
            html += f'<div class="authors">{authors_str}</div>\n'
        
        # Summary
        if show_summary and 'summary' in article:
            summary_html = format_summary(article["summary"])
            html += f'<div class="article-summary">{summary_html}</div>\n'
        
        # Links with share button
        links = []
        if 'url' in article:
            links.append(f'<a href="{article["url"]}" target="_blank">Read More</a>')
        if show_comments and 'comments_url' in article:
            links.append(f'<a href="{article["comments_url"]}" target="_blank">Comments</a>')
        
        if links:
            html += f'<div class="links">\n{chr(10).join(links)}\n'
            
            # Share button with dropdown
            share_url = article.get('url', article.get('comments_url', ''))
            share_title = article_title.replace('"', '&quot;').replace("'", "\\'")
            
            html += f'''<div class="share-container">
    <button class="share-button" onclick="toggleShareMenu(this)">
        <span class="share-arrow">↗</span> Share
    </button>
    <div class="share-menu">
        <button class="share-option" onclick="shareLinkedIn('{share_url}')">
            <span class="share-icon">in</span> LinkedIn
        </button>
        <button class="share-option" onclick="shareTwitter('{share_url}', '{share_title}')">
            <span class="share-icon">𝕏</span> Twitter
        </button>
        <button class="share-option" onclick="copyLink('{share_url}', this)">
            <span class="share-icon">🔗</span> Copy Link
        </button>
    </div>
</div>'''
            html += '\n</div>\n'
        
        html += '</div>\n'
    
    html += '</div>\n'
    return html


def format_summary(summary: str) -> str:
    """
    Format summary text with proper bullet points.
    Converts text bullets (•, *, **) into HTML <ul><li> format.
    """
    if not summary:
        return ""
    
    lines = summary.split('\n')
    formatted = []
    in_list = False
    
    for line in lines:
        line = line.strip()
        if not line:
            if in_list:
                formatted.append('</ul>')
                in_list = False
            continue
        
        # Check if line is a bullet point
        if line.startswith('•') or line.startswith('*') or line.startswith('-'):
            if not in_list:
                formatted.append('<ul>')
                in_list = True
            # Remove bullet character and add as list item
            clean_line = line.lstrip('•*- ').strip()
            # Remove any **text** markdown bold
            clean_line = clean_line.replace('**', '')
            formatted.append(f'<li>{clean_line}</li>')
        
        # Check if it's a header like "Why This Matters:"
        elif ':' in line and len(line) < 50:
            if in_list:
                formatted.append('</ul>')
                in_list = False
            formatted.append(f'<strong>{line}</strong>')
        
        # Regular paragraph text
        else:
            if in_list:
                formatted.append('</ul>')
                in_list = False
            formatted.append(f'<p>{line}</p>')
    
    # Close list if still open
    if in_list:
        formatted.append('</ul>')
    
    return '\n'.join(formatted)