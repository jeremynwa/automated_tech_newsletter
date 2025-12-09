// ===== SAVE FOR LATER FUNCTIONALITY =====
import { applyFilters } from './filters.js';

let savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');

function updateSavedCount() {
  const badge = document.getElementById('saved-badge');
  const viewBtn = document.getElementById('view-saved-button');
  
  badge.textContent = savedArticles.length;
  
  if (savedArticles.length === 0) {
    viewBtn.classList.add('empty');
  } else {
    viewBtn.classList.remove('empty');
  }
  
  updateFabSavedCount();
}

function generateArticleId(title, date) {
  return `${date}-${title.substring(0, 50)}`.replace(/[^a-zA-Z0-9-]/g, '-');
}

function saveArticle(articleElement, digestDate) {
  const title = articleElement.querySelector('.article-title a')?.textContent || 'Untitled';
  const url = articleElement.querySelector('.article-title a')?.href || '#';
  const summary = articleElement.querySelector('.article-summary')?.innerHTML || '';
  
  const articleId = generateArticleId(title, digestDate);
  
  if (savedArticles.some(a => a.id === articleId)) {
    savedArticles = savedArticles.filter(a => a.id !== articleId);
  } else {
    savedArticles.push({
      id: articleId,
      title,
      url,
      summary,
      date: digestDate,
      savedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  updateSavedCount();
  updateSaveButtons();
}

function updateSaveButtons() {
  document.querySelectorAll('.article').forEach(article => {
    const digestDay = article.closest('.digest-day');
    if (!digestDay) return;
    
    const digestDate = digestDay.dataset.date;
    const title = article.querySelector('.article-title a')?.textContent || 'Untitled';
    const articleId = generateArticleId(title, digestDate);
    
    const saveBtn = article.querySelector('.save-button');
    if (saveBtn) {
      const isSaved = savedArticles.some(a => a.id === articleId);
      if (isSaved) {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<span>✓</span><span>Saved</span>';
      } else {
        saveBtn.classList.remove('saved');
        saveBtn.innerHTML = '<span>📌</span><span>Save</span>';
      }
    }
  });
}

function addSaveButtons() {
  document.querySelectorAll('.article').forEach(article => {
    if (article.querySelector('.save-button')) return;
    
    const linksDiv = article.querySelector('.links');
    if (!linksDiv) return;
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-button';
    saveBtn.innerHTML = '<span>📌</span><span>Save</span>';
    
    const digestDay = article.closest('.digest-day');
    const digestDate = digestDay?.dataset.date || '';
    
    saveBtn.addEventListener('click', () => {
      saveArticle(article, digestDate);
    });
    
    linksDiv.insertBefore(saveBtn, linksDiv.firstChild);
  });
  
  updateSaveButtons();
}

function showSavedArticles() {
  const savedView = document.getElementById('saved-articles-view');
  const savedList = document.getElementById('saved-articles-list');
  const feed = document.getElementById('feed');
  
  feed.classList.add('hidden');
  savedView.classList.remove('hidden');
  
  if (savedArticles.length === 0) {
    savedList.innerHTML = '<div class="no-results"><h2>No Saved Articles</h2><p>Save articles to read them later</p></div>';
    return;
  }
  
  savedList.innerHTML = savedArticles.map(article => `
    <div class="saved-article-item">
      <div class="saved-article-date">Saved on ${new Date(article.savedAt).toLocaleDateString()} • From ${article.date}</div>
      <div class="article-title" style="margin-bottom: 0.5rem;">
        <a href="${article.url}" target="_blank">${article.title}</a>
      </div>
      <div class="article-summary" style="margin-bottom: 1rem;">${article.summary}</div>
      <div style="display: flex; gap: 0.5rem;">
        <a href="${article.url}" target="_blank" class="links" style="margin: 0;">
          <span style="padding: 8px 20px; background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%); color: white; border-radius: 8px; text-decoration: none; font-size: 0.9em; font-weight: 600; display: inline-block;">Read More</span>
        </a>
        <button class="remove-saved" data-id="${article.id}">Remove</button>
      </div>
    </div>
  `).join('');
  
  savedList.querySelectorAll('.remove-saved').forEach(btn => {
    btn.addEventListener('click', () => {
      const articleId = btn.dataset.id;
      savedArticles = savedArticles.filter(a => a.id !== articleId);
      localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      updateSavedCount();
      showSavedArticles();
      updateSaveButtons();
    });
  });
}

function closeSavedView() {
  const savedView = document.getElementById('saved-articles-view');
  const feed = document.getElementById('feed');
  
  savedView.classList.add('hidden');
  feed.classList.remove('hidden');
}

function updateFabSavedCount() {
  const fabSavedCount = document.getElementById('fab-saved-count');
  if (fabSavedCount) {
    fabSavedCount.textContent = savedArticles.length;
  }
}

document.getElementById('view-saved-button').addEventListener('click', () => {
  if (savedArticles.length > 0) {
    showSavedArticles();
  }
});

document.getElementById('home-button').addEventListener('click', closeSavedView);
document.getElementById('close-saved-view').addEventListener('click', closeSavedView);

addSaveButtons();
updateSavedCount();

const originalApplyFilters = applyFilters;
window.applyFilters = function() {
  originalApplyFilters();
  setTimeout(() => {
    addSaveButtons();
  }, 200);
};

export { showSavedArticles, updateSavedCount, savedArticles };