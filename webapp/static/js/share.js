// Share functionality
// Add this file as webapp/static/js/share.js

function toggleShareMenu(button) {
  const menu = button.nextElementSibling;
  const allMenus = document.querySelectorAll('.share-menu');
  
  // Close all other menus
  allMenus.forEach(m => {
    if (m !== menu) {
      m.classList.remove('active');
    }
  });
  
  // Toggle current menu
  menu.classList.toggle('active');
  
  // Prevent event bubbling
  event.stopPropagation();
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.share-container')) {
    document.querySelectorAll('.share-menu').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});

function shareLinkedIn(url) {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=600');
}

function shareTwitter(url, title) {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=600');
}

function copyLink(url, button) {
  navigator.clipboard.writeText(url).then(() => {
    // Visual feedback
    const originalHTML = button.innerHTML;
    button.classList.add('copied');
    button.innerHTML = '<span class="share-icon">✓</span> Copied!';
    
    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalHTML;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy link. Please copy manually: ' + url);
  });
}

// Keyboard accessibility - close menu on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.share-menu').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});