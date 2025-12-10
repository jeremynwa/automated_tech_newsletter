// ===== SIMILAR ARTICLES FUNCTIONALITY =====
// Pre-computed using keyword matching (FREE, no API calls)

function extractKeywords(text) {
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'they', 'their', 'them', 'what', 'which', 'who', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'now'
  ]);
  
  // Extract words, convert to lowercase
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Count frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function calculateSimilarity(keywords1, keywords2) {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);
  
  return intersection.length / union.size;
}

function findSimilarArticles(targetArticle, allArticles, limit = 3) {
  const targetTitle = targetArticle.querySelector('.article-title')?.textContent || '';
  const targetSummary = targetArticle.querySelector('.article-summary')?.textContent || '';
  const targetText = `${targetTitle} ${targetSummary}`;
  const targetKeywords = extractKeywords(targetText);
  
  const similarities = [];
  
  allArticles.forEach(article => {
    if (article === targetArticle) return;
    
    const title = article.querySelector('.article-title')?.textContent || '';
    const summary = article.querySelector('.article-summary')?.textContent || '';
    const text = `${title} ${summary}`;
    const keywords = extractKeywords(text);
    
    const similarity = calculateSimilarity(targetKeywords, keywords);
    
    if (similarity > 0.1) { // Minimum threshold
      const digestDay = article.closest('.digest-day');
      const date = digestDay?.dataset.date || '';
      
      similarities.push({
        article,
        similarity,
        title,
        summary: summary.substring(0, 150) + '...',
        url: article.querySelector('.article-title a')?.href || '#',
        date
      });
    }
  });
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function addSimilarArticlesButtons() {
  // Only add to Gemini news articles (World Tech News section)
  document.querySelectorAll('.section').forEach(section => {
    const sectionTitle = section.querySelector('h2')?.textContent.toLowerCase() || '';
    
    if (!sectionTitle.includes('world tech') && !sectionTitle.includes('tech news')) {
      return;
    }
    
    const articles = section.querySelectorAll('.article');
    const allArticles = document.querySelectorAll('.article');
    
    articles.forEach(article => {
      if (article.querySelector('.similar-articles-button')) return;
      
      const linksDiv = article.querySelector('.links');
      if (!linksDiv) return;
      
      const similarBtn = document.createElement('button');
      similarBtn.className = 'similar-articles-button';
      similarBtn.innerHTML = '<span>View Similar Articles</span>';
      
      similarBtn.addEventListener('click', () => {
        toggleSimilarArticles(article, allArticles);
      });
      
      // Add between "Read More" and "Share" buttons
      const shareContainer = linksDiv.querySelector('.share-container');
      if (shareContainer) {
        linksDiv.insertBefore(similarBtn, shareContainer);
      } else {
        linksDiv.appendChild(similarBtn);
      }
    });
  });
}

function toggleSimilarArticles(article, allArticles) {
  const existingContainer = article.querySelector('.similar-articles-container');
  
  if (existingContainer) {
    existingContainer.remove();
    const btn = article.querySelector('.similar-articles-button');
    btn.innerHTML = '<span>View Similar Articles</span>';
    return;
  }
  
  const btn = article.querySelector('.similar-articles-button');
  btn.innerHTML = '<span>Finding Similar...</span>';
  
  setTimeout(() => {
    const similarArticles = findSimilarArticles(article, allArticles, 3);
    
    if (similarArticles.length === 0) {
      btn.innerHTML = '<span>No Similar Articles Found</span>';
      setTimeout(() => {
        btn.innerHTML = '<span>View Similar Articles</span>';
      }, 2000);
      return;
    }
    
    displaySimilarArticles(article, similarArticles);
    btn.innerHTML = '<span>Hide Similar Articles</span>';
  }, 300);
}

function displaySimilarArticles(article, similarArticles) {
  const container = document.createElement('div');
  container.className = 'similar-articles-container';
  
  container.innerHTML = `
    <div class="similar-articles-header">
      <h4>📚 Similar Articles</h4>
    </div>
    <div class="similar-articles-grid">
      ${similarArticles.map(similar => `
        <a href="${similar.url}" target="_blank" class="similar-article-card">
          <div class="similar-article-date">${similar.date}</div>
          <div class="similar-article-title">${similar.title}</div>
          <div class="similar-article-summary">${similar.summary}</div>
          <div class="similar-article-link">Read Article →</div>
        </a>
      `).join('')}
    </div>
  `;
  
  article.appendChild(container);
  
  // Smooth scroll into view
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// Initialize
addSimilarArticlesButtons();

// Initialize
setTimeout(() => {
  addSimilarArticlesButtons();
}, 500);