# automated_tech_newsletter

Get the top tech news using **Gemini** + top **Reddit** & **Hacker News** posts + top **research papers** summarized with **Ollama**, all tracked in a lightweight scrollable web app.

---

## Overview

The system runs daily and collects:

- 🌍 **World Tech News** → fetched *and summarized* directly via Gemini  
- 💬 **Community Tech News** → top posts from Reddit + Hacker News, summarized using a local LLM (Ollama)  
- 📚 **Research Papers** → latest AI/ML papers from arXiv, summarized using Ollama  
- 🗂️ **HTML digest** saved daily under `/archive/YYYY-MM-DD.html`  
- 🌐 **Simple Web App** hosted on Google Cloud Platform free tier, showing each day chronologically (infinite scroll style)

---

## Architecture

```mermaid
flowchart TD

    A[Cron: Daily Trigger] --> B[Gemini: Fetch + Summarize 3 World Tech News]

    A --> C[Hacker News API: Top 3]
    C --> C2[Local LLM (Ollama): Summarize]

    A --> D[Reddit API: Top 3]
    D --> D2[Local LLM (Ollama): Summarize]

    A --> E[arXiv API: 3 New Papers]
    E --> E2[Local LLM (Ollama): Summarize]

    B --> F[Build Daily Digest HTML]
    C2 --> F
    D2 --> F
    E2 --> F

    F --> G[Save as /archive/YYYY-MM-DD.html]

    G --> H[GCP Free-Tier VM]
    H --> I[Web App: Scrollable Daily Archive]
