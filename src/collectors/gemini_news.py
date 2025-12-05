# src/collectors/gemini_news.py

from google import genai
import os
import logging
from typing import List, Dict

# configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Initialize Gemini client
# You can either pass the API key directly or rely on environment variable GEMINI_API_KEY
API_KEY = os.getenv("GEMINI_API_KEY", None)
if not API_KEY:
    logger.error("Missing GEMINI_API_KEY environment variable")
    raise RuntimeError("GEMINI_API_KEY not set")
client = genai.Client(api_key=API_KEY)


def fetch_tech_news(limit: int = 5) -> List[Dict]:
    """
    Fetch a batch of tech news via Gemini.
    Returns list of dicts: { title, url, summary }
    """
    try:
        prompt = f"""Give me a list of the top {limit} most important tech news items for today.
For each news item, output in this format:

Title: <title>
URL: <original URL>
Summary: <a 2-3 sentence summary of the news>

Return the result in plain text where each item is separated by a blank line.
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # or gemini-2.5-pro depending on your access
            contents=prompt
        )
        text = response.text.strip()
        articles = parse_gemini_response(text, limit)
        logger.info(f"Fetched {len(articles)} news articles via Gemini")
        return articles

    except Exception as e:
        logger.error("Error fetching news with Gemini: %s", e)
        return []


def parse_gemini_response(text: str, limit: int) -> List[Dict]:
    """
    Parse plain-text response from Gemini into structured articles.
    Expects format:
    Title: ...
    URL: ...
    Summary: ...
    (blank line)
    """
    articles = []
    entries = [e.strip() for e in text.split("\n\n") if e.strip()]
    for entry in entries:
        lines = entry.split("\n")
        data = {}
        for line in lines:
            if line.startswith("Title:"):
                data["title"] = line[len("Title:"):].strip()
            elif line.startswith("URL:"):
                data["url"] = line[len("URL:"):].strip()
            elif line.startswith("Summary:"):
                data["summary"] = line[len("Summary:"):].strip()
        if "title" in data and "url" in data and "summary" in data:
            articles.append(data)
        if len(articles) >= limit:
            break
    return articles
