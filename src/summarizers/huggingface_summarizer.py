# src/summarizers/hybrid_summarizer.py

import os
import time
import logging
import requests
from typing import List, Dict

# Optionally import transformers (local summarization fallback)
try:
    from transformers import pipeline
    _TRANSFORMERS_AVAILABLE = True
except ImportError:
    _TRANSFORMERS_AVAILABLE = False

from ..utils.helpers import get_logger, truncate_text
from ..utils.config import HF_API_URL  # make sure this is set correctly

logger = get_logger(__name__)

# If transformers is available, instantiate summarizer pipeline once
if _TRANSFORMERS_AVAILABLE:
    try:
        _local_summarizer = pipeline(
            "summarization",
            model=os.getenv("HF_MODEL", "facebook/bart-large-cnn"),
            truncation=True,
            # adjust device / kwargs as needed
        )
        logger.info("Local summarizer (transformers) loaded")
    except Exception as e:
        logger.error("Failed to load local summarizer: %s", e)
        _local_summarizer = None
else:
    logger.warning("transformers library not installed — local fallback disabled.")
    _local_summarizer = None


def _remote_summarize(text: str) -> str:
    """
    Try to summarize via Hugging Face Router API.
    Returns summary string, or raises Exception / returns empty on failure.
    """
    headers = {
        "Authorization": f"Bearer {os.getenv('HF_API_KEY', '')}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": text,
        "parameters": {
            "max_length": 150,
            "min_length": 30,
            "do_sample": False
        }
    }

    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
    except Exception as e:
        logger.error("Remote summarization request failed: %s", e)
        raise

    if response.status_code == 200:
        try:
            result = response.json()
            # Some models return list of dicts
            if isinstance(result, list) and result and "summary_text" in result[0]:
                return result[0]["summary_text"]
            # Some may return dict with 'generated_text' or similar
            if isinstance(result, dict) and result.get("generated_text"):
                return result["generated_text"]
            # Fallback: maybe plain text
            return response.text.strip()
        except ValueError:
            # not json — maybe plain text
            return response.text.strip()

    else:
        # Log errors like 404, 503
        logger.warning("HF remote summarization failed: %s %s", response.status_code, response.text[:200])
        raise RuntimeError(f"HF summarization failed: {response.status_code}")


def _local_summarize(text: str) -> str:
    """
    Summarize locally using transformers (if available).
    """
    if _local_summarizer is None:
        raise RuntimeError("Local summarizer not available (transformers not installed / failed to load)")

    try:
        # The pipeline returns a list of summaries; take first
        res = _local_summarizer(
            text,
            max_length=150,
            min_length=30,
            do_sample=False
        )
        if isinstance(res, list) and res:
            return res[0].get("summary_text") or res[0].get("generated_text") or str(res[0])
        return str(res)
    except Exception as e:
        logger.error("Local summarization failed: %s", e)
        raise


def summarize_article(article: Dict) -> Dict:
    """
    Summarize a single article dict in place: decide which text to use, then summarization.
    """
    # Choose best textual content available
    if article.get("content"):
        content = truncate_text(article["content"], 2000)
    elif article.get("abstract"):
        content = article["abstract"][:1024]
    else:
        content = article.get("title", "")

    # Try remote first
    try:
        summary = _remote_summarize(content)
        article["summary"] = summary
        return article
    except Exception:
        # Remote failed — fallback to local summarization
        if _local_summarizer:
            try:
                summary = _local_summarize(content)
                article["summary"] = summary
                article["_summary_fallback"] = "local"
                return article
            except Exception as e:
                logger.error("Fallback local summarization also failed: %s", e)

    # Worst fallback — just use truncated content / title
    article["summary"] = truncate_text(content, 200)
    article["_summary_fallback"] = "none"
    return article


def summarize_articles(articles: List[Dict]) -> List[Dict]:
    summarized = []
    for i, article in enumerate(articles):
        logger.info(f"Summarizing article {i+1}/{len(articles)}: {article.get('title','')[:60]}")
        summarized.append(summarize_article(article))

        # Optional delay to avoid rate limits
        if i < len(articles) - 1:
            time.sleep(1)
    logger.info(f"Summarized {len(summarized)} articles (remote or local fallback).")
    return summarized
