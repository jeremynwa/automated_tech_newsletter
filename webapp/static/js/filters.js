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