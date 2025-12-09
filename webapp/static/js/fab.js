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

updateFabThemeButton(savedTheme);