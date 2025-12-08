// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeButton(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
});

function updateThemeButton(theme) {
  if (theme === 'dark') {
    themeIcon.textContent = '☀️';
    themeText.textContent = 'Light Mode';
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = 'Dark Mode';
  }
}

// ===== PROGRESS BAR =====
const progressBar = document.getElementById('progress-bar');

window.addEventListener('scroll', () => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
  progressBar.style.width = scrollPercentage + '%';
});

// ===== BACK TO TOP BUTTON =====
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== FILTER LOGIC =====
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const allDigests = document.querySelectorAll('.digest-day');
const digestDates = Array.from(allDigests).map((d) => {
  const dateStr = d.dataset.date;
  const date = new Date(dateStr + 'T00:00:00');
  return { element: d, date: date, dateStr: dateStr };
});

let activeFilters = {
  range: 'all',
  types: ['tech', 'hn', 'research'],
  keyword: '',
  customDate: null,
};

const rangeButtons = document.querySelectorAll('[data-range]');
const typeButtons = document.querySelectorAll('[data-type]');
const applyButton = document.getElementById('apply-filters');
const keywordInput = document.getElementById('keyword-search');
const customDateInput = document.getElementById('custom-date');
const noResults = document.getElementById('no-results');
const activeFiltersContainer = document.getElementById('active-filters');
const pageTransition = document.getElementById('page-transition');

rangeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    rangeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilters.range = btn.dataset.range;
    customDateInput.value = '';
    activeFilters.customDate = null;
  });
});

customDateInput.addEventListener('change', () => {
  rangeButtons.forEach((b) => b.classList.remove('active'));
  activeFilters.range = 'custom';
  activeFilters.customDate = new Date(customDateInput.value + 'T00:00:00');
});

typeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const type = btn.dataset.type;
    if (activeFilters.types.includes(type)) {
      activeFilters.types = activeFilters.types.filter((t) => t !== type);
    } else {
      activeFilters.types.push(type);
    }
  });
});

keywordInput.addEventListener('input', () => {
  activeFilters.keyword = keywordInput.value.toLowerCase().trim();
});

applyButton.addEventListener('click', applyFilters);
keywordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') applyFilters();
});

function applyFilters() {
  pageTransition.classList.add('active');

  setTimeout(() => {
    let visibleCount = 0;

    digestDates.forEach(({ element, date, dateStr }) => {
      let showDigest = false;

      if (activeFilters.range === 'all') {
        showDigest = true;
      } else if (activeFilters.range === 'custom' && activeFilters.customDate) {
        showDigest = date.getTime() === activeFilters.customDate.getTime();
      } else if (activeFilters.range === 'today') {
        showDigest = date.getTime() === TODAY.getTime();
      } else if (activeFilters.range === '3days') {
        const threeDaysAgo = new Date(TODAY);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        showDigest = date >= threeDaysAgo;
      } else if (activeFilters.range === 'week') {
        const weekAgo = new Date(TODAY);
        weekAgo.setDate(weekAgo.getDate() - 7);
        showDigest = date >= weekAgo;
      } else if (activeFilters.range === 'month') {
        const monthAgo = new Date(TODAY);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        showDigest = date >= monthAgo;
      }

      if (!showDigest) {
        element.classList.add('hidden');
        return;
      }

      const sections = element.querySelectorAll('.section');
      let hasVisibleContent = false;

      sections.forEach((section) => {
        const sectionHeader = section.querySelector('h2');
        if (!sectionHeader) return;

        const headerText = sectionHeader.textContent.toLowerCase();
        let sectionType = '';

        if (headerText.includes('world tech') || headerText.includes('tech news')) {
          sectionType = 'tech';
        } else if (headerText.includes('hacker news')) {
          sectionType = 'hn';
        } else if (headerText.includes('research')) {
          sectionType = 'research';
        }

        const isTypeSelected = activeFilters.types.includes(sectionType);

        if (!isTypeSelected) {
          section.style.display = 'none';
          return;
        }

        if (activeFilters.keyword) {
          const articles = section.querySelectorAll('.article');
          let visibleArticles = 0;

          articles.forEach((article) => {
            const articleText = article.textContent.toLowerCase();
            if (articleText.includes(activeFilters.keyword)) {
              article.classList.remove('hidden');
              article.classList.add('keyword-match');
              visibleArticles++;
            } else {
              article.classList.add('hidden');
              article.classList.remove('keyword-match');
            }
          });

          if (visibleArticles > 0) {
            section.style.display = 'block';
            hasVisibleContent = true;
          } else {
            section.style.display = 'none';
          }
        } else {
          const articles = section.querySelectorAll('.article');
          articles.forEach((article) => {
            article.classList.remove('hidden');
            article.classList.remove('keyword-match');
          });
          section.style.display = 'block';
          hasVisibleContent = true;
        }
      });

      if (hasVisibleContent) {
        element.classList.remove('hidden');
        visibleCount++;
      } else {
        element.classList.add('hidden');
      }
    });

    if (visibleCount === 0) {
      noResults.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
    }

    updateActiveFiltersChips();

    // Update TOC visibility after filtering
    setTimeout(() => {
      document.querySelectorAll('.toc-link').forEach(link => {
        const dateStr = link.dataset.date;
        const digestElement = document.querySelector(`.digest-day[data-date="${dateStr}"]`);
        
        if (digestElement && digestElement.classList.contains('hidden')) {
          link.classList.add('hidden');
        } else {
          link.classList.remove('hidden');
        }
      });
    }, 50);

    pageTransition.classList.remove('active');
  }, 150);
}

function updateActiveFiltersChips() {
  activeFiltersContainer.innerHTML = '';
  
  if (activeFilters.range !== 'all') {
    const rangeText = activeFilters.range === 'custom' 
      ? `Date: ${customDateInput.value}` 
      : activeFilters.range === 'today' ? 'Today'
      : activeFilters.range === '3days' ? 'Last 3 Days'
      : activeFilters.range === 'week' ? 'Last Week'
      : 'Last Month';
    
    addFilterChip(rangeText, () => {
      rangeButtons.forEach(b => {
        if (b.dataset.range === 'all') b.classList.add('active');
        else b.classList.remove('active');
      });
      activeFilters.range = 'all';
      customDateInput.value = '';
      activeFilters.customDate = null;
      applyFilters();
    });
  }

  if (activeFilters.keyword) {
    addFilterChip(`Keyword: "${activeFilters.keyword}"`, () => {
      keywordInput.value = '';
      activeFilters.keyword = '';
      applyFilters();
    });
  }

  if (activeFilters.types.length < 3) {
    const disabledTypes = ['tech', 'hn', 'research'].filter(
      t => !activeFilters.types.includes(t)
    );
    const typeNames = {
      tech: 'World Tech News',
      hn: 'Hacker News',
      research: 'Research Papers'
    };
    
    disabledTypes.forEach(type => {
      addFilterChip(`Hidden: ${typeNames[type]}`, () => {
        typeButtons.forEach(btn => {
          if (btn.dataset.type === type) {
            btn.classList.add('active');
            activeFilters.types.push(type);
          }
        });
        applyFilters();
      });
    });
  }
}

function addFilterChip(text, onRemove) {
  const chip = document.createElement('div');
  chip.className = 'filter-chip';
  chip.innerHTML = `
    <span>${text}</span>
    <span class="filter-chip-close">×</span>
  `;
  chip.querySelector('.filter-chip-close').addEventListener('click', onRemove);
  activeFiltersContainer.appendChild(chip);
}

applyFilters();

// ===== TABLE OF CONTENTS =====
const tocList = document.getElementById('toc-list');
const tocSidebar = document.getElementById('toc-sidebar');
const tocToggle = document.getElementById('toc-toggle');
const tocOverlay = document.getElementById('toc-overlay');

// Generate TOC
function generateTOC() {
  tocList.innerHTML = '';
  digestDates.forEach(({ element, dateStr }) => {
    const li = document.createElement('li');
    li.className = 'toc-item';
    
    const a = document.createElement('a');
    a.className = 'toc-link';
    a.href = `#date-${dateStr}`;
    a.textContent = element.querySelector('.date-text').textContent;
    a.dataset.date = dateStr;
    
    a.addEventListener('click', (e) => {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      if (window.innerWidth <= 768) {
        tocSidebar.classList.remove('mobile-open');
        tocOverlay.classList.remove('active');
      }
    });
    
    li.appendChild(a);
    tocList.appendChild(li);
  });
}

// TOC Active Highlight
function updateActiveTOCItem() {
  const scrollPosition = window.scrollY + 100;
  
  let activeDate = null;
  digestDates.forEach(({ element, dateStr }) => {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    
    if (scrollPosition >= elementTop) {
      activeDate = dateStr;
    }
  });
  
  document.querySelectorAll('.toc-link').forEach(link => {
    if (link.dataset.date === activeDate) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Mobile TOC
tocToggle.addEventListener('click', () => {
  tocSidebar.classList.add('mobile-open');
  tocOverlay.classList.add('active');
});

tocOverlay.addEventListener('click', () => {
  tocSidebar.classList.remove('mobile-open');
  tocOverlay.classList.remove('active');
});

// Initialize TOC
generateTOC();
window.addEventListener('scroll', updateActiveTOCItem);
updateActiveTOCItem();

// Add IDs to digest days
digestDates.forEach(({ element, dateStr }) => {
  element.id = `date-${dateStr}`;
});

// ===== SAVE FOR LATER FUNCTIONALITY =====
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

document.getElementById('view-saved-button').addEventListener('click', () => {
  if (savedArticles.length > 0) {
    showSavedArticles();
  }
});

document.getElementById('home-button').addEventListener('click', closeSavedView);
document.getElementById('close-saved-view').addEventListener('click', closeSavedView);

addSaveButtons();
updateSavedCount();

// Re-add save buttons after filtering
const originalApplyFilters = applyFilters;
applyFilters = function() {
  originalApplyFilters();
  setTimeout(() => {
    addSaveButtons();
  }, 200);
};

// ===== FLOATING ACTION BUTTON =====
const fab = document.getElementById('fab');
const fabMenu = document.getElementById('fab-menu');
let fabMenuOpen = false;

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    fab.classList.add('visible');
  } else {
    fab.classList.remove('visible');
    fabMenu.classList.remove('open');
    fabMenuOpen = false;
  }
});

fab.addEventListener('click', () => {
  fabMenuOpen = !fabMenuOpen;
  if (fabMenuOpen) {
    fabMenu.classList.add('open');
  } else {
    fabMenu.classList.remove('open');
  }
});

document.addEventListener('click', (e) => {
  if (!fab.contains(e.target) && !fabMenu.contains(e.target)) {
    fabMenu.classList.remove('open');
    fabMenuOpen = false;
  }
});

document.getElementById('fab-theme').addEventListener('click', () => {
  themeToggle.click();
  updateFabThemeButton(html.getAttribute('data-theme'));
});

document.getElementById('fab-saved').addEventListener('click', () => {
  if (savedArticles.length > 0) {
    showSavedArticles();
    fabMenu.classList.remove('open');
    fabMenuOpen = false;
  }
});

document.getElementById('fab-scroll-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fabMenu.classList.remove('open');
  fabMenuOpen = false;
});

function updateFabThemeButton(theme) {
  const fabThemeIcon = document.getElementById('fab-theme-icon');
  const fabThemeText = document.getElementById('fab-theme-text');
  if (theme === 'dark') {
    fabThemeIcon.textContent = '☀️';
    fabThemeText.textContent = 'Light Mode';
  } else {
    fabThemeIcon.textContent = '🌙';
    fabThemeText.textContent = 'Dark Mode';
  }
}

function updateFabSavedCount() {
  document.getElementById('fab-saved-count').textContent = savedArticles.length;
}

const originalUpdateSavedCount = updateSavedCount;
updateSavedCount = function() {
  originalUpdateSavedCount();
  updateFabSavedCount();
};

// Initialize
updateFabThemeButton(savedTheme);
updateFabSavedCount();
