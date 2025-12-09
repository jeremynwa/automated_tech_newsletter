// ===== TABLE OF CONTENTS =====
import { digestDates } from './filters.js';

const tocList = document.getElementById('toc-list');
const tocSidebar = document.getElementById('toc-sidebar');
const tocToggle = document.getElementById('toc-toggle');
const tocOverlay = document.getElementById('toc-overlay');

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

tocToggle.addEventListener('click', () => {
  tocSidebar.classList.add('mobile-open');
  tocOverlay.classList.add('active');
});

tocOverlay.addEventListener('click', () => {
  tocSidebar.classList.remove('mobile-open');
  tocOverlay.classList.remove('active');
});

generateTOC();
window.addEventListener('scroll', updateActiveTOCItem);
updateActiveTOCItem();

digestDates.forEach(({ element, dateStr }) => {
  element.id = `date-${dateStr}`;
});