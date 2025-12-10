// ===== GLOBAL NEWSLETTER TTS SYSTEM =====
// Reads entire newsletter with floating player

let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isPlaying = false;
let isPaused = false;
let allArticles = [];
let currentArticleIndex = 0;
let voicesLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
  // Load voices (important for Chrome/Edge)
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
    };
  }
  
  // Try to load voices immediately
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
  }
  
  initializeGlobalTTS();
});

function initializeGlobalTTS() {
  const globalPlayButton = document.getElementById('global-play-button');
  const floatingPlayer = document.getElementById('floating-tts-player');
  const floatingControl = document.getElementById('floating-tts-control');
  
  if (!globalPlayButton) return;
  
  // Calculate reading time
  calculateReadingTime();
  
  // Global play button click
  globalPlayButton.addEventListener('click', () => {
    if (!isPlaying && !isPaused) {
      // Start fresh
      startNewsletterReading();
    } else if (isPaused) {
      // Resume from pause
      resumeReading();
    } else if (isPlaying) {
      // Pause
      pauseReading();
    }
  });
  
  // Floating player control
  if (floatingControl) {
    floatingControl.addEventListener('click', () => {
      if (isPaused) {
        resumeReading();
      } else {
        pauseReading();
      }
    });
  }
  
  // Floating player stop button
  const floatingStop = document.getElementById('floating-tts-stop');
  if (floatingStop) {
    floatingStop.addEventListener('click', () => {
      stopReading();
    });
  }
  
  // Floating player skip button
  const floatingSkip = document.getElementById('floating-tts-skip');
  if (floatingSkip) {
    floatingSkip.addEventListener('click', () => {
      skipToNextArticle();
    });
  }
  
  // Stop button (you can add this to floating player)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPlaying) {
      stopReading();
    }
  });
}

function calculateReadingTime() {
  // Get all visible article text
  const articles = document.querySelectorAll('.article:not(.hidden)');
  let totalWords = 0;
  
  articles.forEach(article => {
    const title = article.querySelector('.article-title')?.textContent || '';
    const summary = article.querySelector('.article-summary')?.textContent || '';
    const text = `${title} ${summary}`;
    totalWords += text.split(/\s+/).length;
  });
  
  // Average reading speed: 150 words per minute for TTS
  const minutes = Math.ceil(totalWords / 150);
  
  const readingTimeEl = document.getElementById('reading-time');
  if (readingTimeEl) {
    readingTimeEl.textContent = `(~${minutes} min)`;
  }
}

function gatherAllArticles() {
  allArticles = [];
  const articles = document.querySelectorAll('.article:not(.hidden)');
  
  articles.forEach(article => {
    const title = article.querySelector('.article-title')?.textContent || '';
    const summary = article.querySelector('.article-summary')?.textContent || '';
    
    if (title || summary) {
      allArticles.push({
        title: title,
        content: summary,
        element: article
      });
    }
  });
  
  return allArticles;
}

function startNewsletterReading() {
  gatherAllArticles();
  
  if (allArticles.length === 0) {
    alert('No articles to read');
    return;
  }
  
  // Make sure voices are loaded
  if (!voicesLoaded) {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
    }
  }
  
  currentArticleIndex = 0;
  isPlaying = true;
  isPaused = false;
  
  // Show floating player
  const floatingPlayer = document.getElementById('floating-tts-player');
  if (floatingPlayer) {
    floatingPlayer.classList.remove('hidden');
  }
  
  // Update global button
  updateGlobalButton('pause');
  
  // Start reading
  readNextArticle();
}

function readNextArticle() {
  if (currentArticleIndex >= allArticles.length) {
    // Finished reading all articles
    stopReading();
    return;
  }
  
  const article = allArticles[currentArticleIndex];
  
  // Update floating player status
  updateFloatingStatus(`Reading article ${currentArticleIndex + 1} of ${allArticles.length}`);
  
  // Scroll to article
  if (article.element) {
    article.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  // Create utterance
  const textToRead = `${article.title}. ${article.content}`;
  currentUtterance = new SpeechSynthesisUtterance(textToRead);
  
  // Select a warm, natural voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = selectBestVoice(voices);
  if (preferredVoice) {
    currentUtterance.voice = preferredVoice;
  }
  
  // Settings for natural, warm reading
  currentUtterance.rate = 0.95;  // Slightly slower for clarity
  currentUtterance.pitch = 1.1;   // Slightly higher for warmth
  currentUtterance.volume = 1.0;
  
  currentUtterance.onend = () => {
    currentArticleIndex++;
    readNextArticle();
  };
  
  currentUtterance.onerror = (event) => {
    console.error('Speech error:', event);
    currentArticleIndex++;
    readNextArticle();
  };
  
  speechSynthesis.speak(currentUtterance);
}

function selectBestVoice(voices) {
  if (!voices || voices.length === 0) return null;
  
  // Priority order for warm, natural voices:
  // 1. Google US English Female
  // 2. Microsoft Zira (US English Female)
  // 3. Apple Samantha (US English Female)
  // 4. Any female voice
  // 5. Any English voice
  
  const voicePriority = [
    // Google voices (very natural)
    { name: 'Google US English', gender: 'female' },
    { name: 'Google UK English Female', gender: 'female' },
    
    // Microsoft voices (good quality)
    { name: 'Microsoft Zira', lang: 'en-US' },
    { name: 'Microsoft Susan', lang: 'en-GB' },
    
    // Apple voices (very natural on Mac/iOS)
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Karen', lang: 'en-AU' },
    { name: 'Moira', lang: 'en-IE' },
    
    // Other quality voices
    { name: 'Alex', lang: 'en-US' },
    { name: 'Fiona', lang: 'en-GB' },
  ];
  
  // Try to find preferred voices
  for (const preferred of voicePriority) {
    const voice = voices.find(v => 
      v.name.includes(preferred.name) || 
      (preferred.lang && v.lang.includes(preferred.lang))
    );
    if (voice) return voice;
  }
  
  // Fallback: any female English voice
  const femaleVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('female') || 
     v.name.toLowerCase().includes('woman') ||
     v.name.includes('Zira') ||
     v.name.includes('Susan'))
  );
  if (femaleVoice) return femaleVoice;
  
  // Final fallback: any English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  return englishVoice || voices[0];
}

function pauseReading() {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    isPaused = true;
    isPlaying = true; // Keep isPlaying true when paused
    updateGlobalButton('resume');
    updateFloatingButton('resume');
    updateFloatingStatus('Paused');
  }
}

function resumeReading() {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    isPaused = false;
    isPlaying = true; // Ensure isPlaying is true
    updateGlobalButton('pause');
    updateFloatingButton('pause');
    updateFloatingStatus(`Reading article ${currentArticleIndex + 1} of ${allArticles.length}`);
  }
}

function stopReading() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  isPlaying = false;
  isPaused = false;
  currentArticleIndex = 0;
  currentUtterance = null;
  
  // Hide floating player
  const floatingPlayer = document.getElementById('floating-tts-player');
  if (floatingPlayer) {
    floatingPlayer.classList.add('hidden');
  }
  
  // Reset global button
  updateGlobalButton('play');
}

function skipToNextArticle() {
  if (!isPlaying) return;
  
  // Stop current speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Move to next article
  currentArticleIndex++;
  
  // If we've reached the end, stop
  if (currentArticleIndex >= allArticles.length) {
    stopReading();
    return;
  }
  
  // Reset pause state if paused
  if (isPaused) {
    isPaused = false;
    updateGlobalButton('pause');
    updateFloatingButton('pause');
  }
  
  // Read next article
  readNextArticle();
}

function updateGlobalButton(state) {
  const button = document.getElementById('global-play-button');
  const icon = document.getElementById('global-play-icon');
  const text = document.getElementById('global-play-text');
  
  if (!button) return;
  
  if (state === 'play') {
    icon.textContent = '▶';
    text.textContent = 'Listen to Newsletter';
    button.classList.remove('playing');
  } else if (state === 'pause') {
    icon.textContent = '⏸';
    text.textContent = 'Pause Newsletter';
    button.classList.add('playing');
  } else if (state === 'resume') {
    icon.textContent = '▶';
    text.textContent = 'Resume Newsletter';
    button.classList.add('playing');
  }
}

function updateFloatingButton(state) {
  const icon = document.getElementById('floating-tts-icon');
  
  if (!icon) return;
  
  if (state === 'pause') {
    icon.textContent = '⏸';
  } else if (state === 'resume') {
    icon.textContent = '▶';
  }
}

function updateFloatingStatus(text) {
  const status = document.getElementById('floating-tts-status');
  if (status) {
    status.textContent = text;
  }
}

// Update floating player position on scroll
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const floatingPlayer = document.getElementById('floating-tts-player');
  if (!floatingPlayer || floatingPlayer.classList.contains('hidden')) return;
  
  // Keep it visible at bottom center
  const scrollDiff = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;
  
  // It will stay fixed at bottom due to CSS
});

// Stop on page unload
window.addEventListener('beforeunload', stopReading);

// Recalculate when filters change
if (typeof applyFilters !== 'undefined') {
  const originalApplyFilters = applyFilters;
  applyFilters = function() {
    stopReading();
    originalApplyFilters();
    setTimeout(() => {
      calculateReadingTime();
    }, 200);
  };
}