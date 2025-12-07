# src/collectors/gemini_news.py

from google import genai
import os
import logging
from typing import List, Dict

# configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Initialize Gemini client
API_KEY = os.getenv("GEMINI_API_KEY", None)
if not API_KEY:
    logger.error("Missing GEMINI_API_KEY environment variable")
    raise RuntimeError("GEMINI_API_KEY not set")
client = genai.Client(api_key=API_KEY)


def fetch_tech_news(limit: int = 5) -> List[Dict]:
    """
    Fetch a batch of tech news via Gemini with enhanced explanations.
    Returns list of dicts: { title, url, summary }
    """
    try:
        prompt = f"""Give me a list of the top {limit} most important tech news items for today.

For each news item, provide:
1. A clear, descriptive title
2. The original source URL
3. A summary written for someone who isn't a tech expert, including:
   - What happened (2-3 sentences)
   - Why this matters (explained simply with bullet points)
   - Real-world impact or significance

Format each item EXACTLY like this:

Title: <title>
URL: <original URL>
Summary: <2-3 sentence explanation of what happened>

Why This Matters:
• <first key reason explained simply>
• <second key reason explained simply>
• <third key reason if relevant>

---

Make the explanations accessible to non-technical readers. Use simple language and analogies where helpful. Focus on practical implications and real-world impact.

Return plain text with each news item separated by --- (three dashes)."""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        text = response.text.strip()
        articles = parse_gemini_response_enhanced(text, limit)
        logger.info(f"Fetched {len(articles)} news articles via Gemini")
        return articles

    except Exception as e:
        logger.error("Error fetching news with Gemini: %s", e)
        return []


def parse_gemini_response_enhanced(text: str, limit: int) -> List[Dict]:
    """
    Parse enhanced plain-text response from Gemini into structured articles.
    Expects format with "Why This Matters:" section.
    """
    articles = []
    entries = [e.strip() for e in text.split("---") if e.strip()]
    
    for entry in entries:
        lines = entry.split("\n")
        data = {}
        summary_lines = []
        why_matters = []
        in_why_section = False
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.startswith("Title:"):
                data["title"] = line[len("Title:"):].strip()
            elif line.startswith("URL:"):
                data["url"] = line[len("URL:"):].strip()
            elif line.startswith("Summary:"):
                summary_lines.append(line[len("Summary:"):].strip())
            elif line.startswith("Why This Matters:"):
                in_why_section = True
            elif in_why_section and line.startswith("•"):
                why_matters.append(line)
            elif not line.startswith("Title:") and not line.startswith("URL:") and not line.startswith("Why"):
                if in_why_section and line.startswith("•"):
                    why_matters.append(line)
                elif not in_why_section:
                    summary_lines.append(line)
        
        # Combine summary and why it matters
        full_summary = " ".join(summary_lines)
        if why_matters:
            full_summary += "\n\n<strong>Why This Matters:</strong>\n" + "\n".join(why_matters)
        
        if "title" in data and "url" in data and full_summary:
            data["summary"] = full_summary
            articles.append(data)
        
        if len(articles) >= limit:
            break
    
    return articles