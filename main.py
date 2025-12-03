"""
Main orchestrator - runs the daily tech newsletter pipeline.
This script:
1. Collects content from all sources
2. Summarizes content using Hugging Face (except Gemini news which is pre-summarized)
3. Generates HTML digest
4. Saves to archive directory
"""

import sys
from src.utils.config import validate_config
from src.utils.helpers import get_logger, get_today_date, get_archive_path, save_html
from src.collectors.gemini_news import fetch_and_summarize_news
from src.collectors.hackernews import fetch_top_stories
from src.collectors.reddit import fetch_top_posts
from src.collectors.arxiv import fetch_latest_papers
from src.summarizers.huggingface_summarizer import summarize_articles
from src.generators.html_generator import generate_daily_html

logger = get_logger(__name__)

def main():
    """Main pipeline execution"""
    try:
        # Validate configuration
        logger.info("Starting tech newsletter pipeline")
        validate_config()
        logger.info("Configuration validated")
        
        # Get today's date
        date = get_today_date()
        logger.info(f"Generating digest for {date}")
        
        # === STEP 1: COLLECT CONTENT ===
        logger.info("=" * 50)
        logger.info("STEP 1: Collecting content from sources")
        logger.info("=" * 50)
        
        # Gemini news (already summarized)
        logger.info("Fetching world tech news via Gemini...")
        gemini_news = fetch_and_summarize_news()
        
        # Hacker News
        logger.info("Fetching Hacker News top stories...")
        hn_posts = fetch_top_stories()
        
        # Reddit
        logger.info("Fetching Reddit top posts...")
        reddit_posts = fetch_top_posts()
        
        # arXiv papers
        logger.info("Fetching arXiv papers...")
        papers = fetch_latest_papers()
        
        # === STEP 2: SUMMARIZE CONTENT ===
        logger.info("=" * 50)
        logger.info("STEP 2: Summarizing content with Hugging Face")
        logger.info("=" * 50)
        
        # Summarize HN posts
        if hn_posts:
            logger.info("Summarizing Hacker News posts...")
            hn_posts = summarize_articles(hn_posts)
        
        # Summarize Reddit posts
        if reddit_posts:
            logger.info("Summarizing Reddit posts...")
            reddit_posts = summarize_articles(reddit_posts)
        
        # Summarize papers
        if papers:
            logger.info("Summarizing arXiv papers...")
            papers = summarize_articles(papers)
        
        # === STEP 3: GENERATE HTML ===
        logger.info("=" * 50)
        logger.info("STEP 3: Generating HTML digest")
        logger.info("=" * 50)
        
        html_content = generate_daily_html(
            gemini_news=gemini_news,
            hn_posts=hn_posts,
            reddit_posts=reddit_posts,
            papers=papers,
            date=date
        )
        
        # === STEP 4: SAVE TO ARCHIVE ===
        logger.info("=" * 50)
        logger.info("STEP 4: Saving to archive")
        logger.info("=" * 50)
        
        from src.utils.config import ARCHIVE_DIR
        archive_path = get_archive_path(ARCHIVE_DIR, date)
        save_html(html_content, archive_path)
        
        # Summary
        logger.info("=" * 50)
        logger.info("PIPELINE COMPLETE!")
        logger.info("=" * 50)
        logger.info(f"Gemini News: {len(gemini_news)} articles")
        logger.info(f"Hacker News: {len(hn_posts)} posts")
        logger.info(f"Reddit: {len(reddit_posts)} posts")
        logger.info(f"arXiv Papers: {len(papers)} papers")
        logger.info(f"Saved to: {archive_path}")
        logger.info("=" * 50)
        
        return 0
    
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())