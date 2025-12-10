// ===== GLOBAL NEWSLETTER TTS SYSTEM - FIXED =====

let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isPlaying = false;
let isPaused = false;
let allArticles = [];
let currentArticleIndex = 0;
let voicesLoaded = false;

// CRITICAL: Store the current text being read for resume functionality
let currentArticleText = '';
let currentCharIndex = 0;

// Wait for page to fully load
window.addEventListener('load', function() {
  // Force voice loading
  speechSynthesis.getVoices();
  
  // Wait for voices with multiple attempts
  let attempts = 0;
  const checkVoices = setInterval(() => {
    const voices = speechSynthesis.getVoices();
    attempts++;
    
    if (voices.length > 0) {
      voicesLoaded = true;
      console.log('✓ TTS voices loaded:', voices.length);
      clearInterval(checkVoices);
      initializeGlobalTTS();
    } else if (attempts > 20) {
      console.warn('⚠ Voices not loading, initializing anyway');
      clearInterval(checkVoices);
      initializeGlobalTTS();
    }
  }, 100);
  
  // Backup: voices changed event
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      if (!voicesLoaded) {
        voicesLoaded = true;
        console.log('✓ TTS voices loaded via event:', speechSynthesis.getVoices().length);
      }
    };
  }
});

function initializeGlobalTTS() {
  const globalPlayButton = document.getElementById('global-play-button');
  const floatingPlayer = document.getElementById('floating-tts-player');
  const floatingControl = document.getElementById('floating-tts-control');
  
  if (!globalPlayButton) {
    console.error('❌ Global play button not found');
    return;
  }
  
  console.log('🎵 Initializing TTS system...');
  
  // Calculate reading time
  calculateReadingTime();
  
  // Global play button click
  globalPlayButton.addEventListener('click', (e) => {
    e.preventDefault();
    handlePlayPause();
  });
  
  // Floating player control
  if (floatingControl) {
    floatingControl.addEventListener('click', (e) => {
      e.preventDefault();
      handlePlayPause();
    });
  }
  
  // Floating player stop button
  const floatingStop = document.getElementById('floating-tts-stop');
  if (floatingStop) {
    floatingStop.addEventListener('click', (e) => {
      e.preventDefault();
      stopReading();
    });
  }
  
  // Floating player skip button
  const floatingSkip = document.getElementById('floating-tts-skip');
  if (floatingSkip) {
    floatingSkip.addEventListener('click', (e) => {
      e.preventDefault();
      skipToNextArticle();
    });
  }
  
  // Stop on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (isPlaying || isPaused)) {
      stopReading();
    }
  });
  
  console.log('✓ TTS system initialized');
}

function handlePlayPause() {
  console.log('🎮 Play/Pause clicked. State:', { isPlaying, isPaused });
  
  if (!isPlaying && !isPaused) {
    // START: Fresh start
    startNewsletterReading();
  } else if (isPaused) {
    // RESUME: Continue from where we paused
    resumeReading();
  } else if (isPlaying) {
    // PAUSE: Pause current playback
    pauseReading();
  }
}

function calculateReadingTime() {
  const articles = document.querySelectorAll('.article:not(.hidden)');
  let totalWords = 0;
  
  articles.forEach(article => {
    const title = article.querySelector('.article-title')?.textContent || '';
    const summary = article.querySelector('.article-summary')?.textContent || '';
    const text = `${title} ${summary}`;
    totalWords += text.split(/\s+/).length;
  });
  
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
  
  console.log(`📚 Gathered ${allArticles.length} articles`);
  return allArticles;
}

function startNewsletterReading() {
  console.log('▶ Starting newsletter reading...');
  
  // CRITICAL: Cancel any existing speech first
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    console.log('⚠ Canceling previous speech...');
    speechSynthesis.cancel();
    // Wait for cancellation to complete
    setTimeout(() => continueStarting(), 200);
    return;
  }
  
  continueStarting();
}

function continueStarting() {
  // Gather articles
  gatherAllArticles();
  
  if (allArticles.length === 0) {
    alert('No articles to read');
    return;
  }
  
  // Check voices
  let voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    console.warn('⚠ No voices available yet');
    alert('Text-to-speech not ready. Please wait a moment and try again.');
    return;
  }
  
  // Reset state
  currentArticleIndex = 0;
  currentCharIndex = 0;
  isPlaying = true;
  isPaused = false;
  
  // Show floating player
  const floatingPlayer = document.getElementById('floating-tts-player');
  if (floatingPlayer) {
    floatingPlayer.classList.remove('hidden');
  }
  
  // Update UI
  updateGlobalButton('pause');
  updateFloatingButton('pause');
  
  // Start reading
  console.log('🎤 Starting to read articles...');
  readNextArticle();
}

function readNextArticle() {
  console.log(`📖 Reading article ${currentArticleIndex + 1}/${allArticles.length}`);
  
  // Check if finished
  if (currentArticleIndex >= allArticles.length) {
    console.log('✓ Finished all articles');
    stopReading();
    return;
  }
  
  const article = allArticles[currentArticleIndex];
  
  // Update status
  updateFloatingStatus(`Reading ${currentArticleIndex + 1} of ${allArticles.length}`);
  
  // Scroll to article
  if (article.element) {
    article.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  // Store full text for resume functionality
  currentArticleText = `${article.title}. ${article.content}`;
  currentCharIndex = 0;
  
  // Create utterance
  speakText(currentArticleText);
}

function speakText(text) {
  // Cancel any existing speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Create new utterance
  currentUtterance = new SpeechSynthesisUtterance(text);
  
  // Select voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = selectBestVoice(voices);
  if (preferredVoice) {
    currentUtterance.voice = preferredVoice;
  }
  
  // Settings
  currentUtterance.rate = 0.95;
  currentUtterance.pitch = 1.1;
  currentUtterance.volume = 1.0;
  
  // Event handlers
  currentUtterance.onstart = () => {
    console.log('🎤 Speech started');
    isPlaying = true;
    isPaused = false;
  };
  
  currentUtterance.onend = () => {
    console.log('✓ Speech ended');
    
    // Only proceed if we're still in playing state
    if (isPlaying && !isPaused) {
      currentArticleIndex++;
      setTimeout(() => readNextArticle(), 500);
    }
  };
  
  currentUtterance.onerror = (event) => {
    console.error('❌ Speech error:', event.error);
    
    // Handle interrupted error (happens on cancel)
    if (event.error === 'interrupted' || event.error === 'canceled') {
      console.log('ℹ Speech was interrupted (normal for pause/stop)');
      return;
    }
    
    // For other errors, skip to next
    currentArticleIndex++;
    if (isPlaying) {
      readNextArticle();
    }
  };
  
  // Speak
  console.log('🔊 Speaking...');
  speechSynthesis.speak(currentUtterance);
}

function pauseReading() {
  console.log('⏸ Pausing...');
  
  if (!speechSynthesis.speaking) {
    console.warn('⚠ Nothing playing to pause');
    return;
  }
  
  // IMPORTANT: speechSynthesis.pause() is unreliable across browsers
  // Better to cancel and remember position
  speechSynthesis.cancel();
  
  isPaused = true;
  isPlaying = false;
  
  updateGlobalButton('resume');
  updateFloatingButton('resume');
  updateFloatingStatus('Paused');
  
  console.log('✓ Paused');
}

function resumeReading() {
  console.log('▶ Resuming...');
  
  if (!isPaused) {
    console.warn('⚠ Not paused, cannot resume');
    return;
  }
  
  isPaused = false;
  isPlaying = true;
  
  updateGlobalButton('pause');
  updateFloatingButton('pause');
  updateFloatingStatus(`Reading ${currentArticleIndex + 1} of ${allArticles.length}`);
  
  // Re-read current article from where we left off
  // Note: We're re-reading from the start of current article
  // True character-level resume is complex with Web Speech API
  speakText(currentArticleText);
  
  console.log('✓ Resumed');
}

function stopReading() {
  console.log('⏹ Stopping...');
  
  // Cancel speech
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
  }
  
  // Reset all state
  isPlaying = false;
  isPaused = false;
  currentArticleIndex = 0;
  currentCharIndex = 0;
  currentArticleText = '';
  currentUtterance = null;
  
  // Hide floating player
  const floatingPlayer = document.getElementById('floating-tts-player');
  if (floatingPlayer) {
    floatingPlayer.classList.add('hidden');
  }
  
  // Reset buttons
  updateGlobalButton('play');
  updateFloatingButton('play');
  
  console.log('✓ Stopped and reset');
}

function skipToNextArticle() {
  console.log('⏭ Skipping to next...');
  
  if (!isPlaying && !isPaused) {
    console.warn('⚠ Not playing, cannot skip');
    return;
  }
  
  // Cancel current speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Move to next
  currentArticleIndex++;
  
  // Check if at end
  if (currentArticleIndex >= allArticles.length) {
    console.log('ℹ No more articles');
    stopReading();
    return;
  }
  
  // Reset pause if paused
  if (isPaused) {
    isPaused = false;
    isPlaying = true;
    updateGlobalButton('pause');
    updateFloatingButton('pause');
  }
  
  // Read next
  setTimeout(() => readNextArticle(), 100);
}

function selectBestVoice(voices) {
  if (!voices || voices.length === 0) return null;
  
  const voicePriority = [
    'Google US English',
    'Google UK English Female',
    'Microsoft Zira',
    'Samantha',
    'Karen',
    'Alex'
  ];
  
  // Try priority list
  for (const preferred of voicePriority) {
    const voice = voices.find(v => v.name.includes(preferred));
    if (voice) return voice;
  }
  
  // Fallback to any English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  return englishVoice || voices[0];
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
    text.textContent = 'Pause';
    button.classList.add('playing');
  } else if (state === 'resume') {
    icon.textContent = '▶';
    text.textContent = 'Resume';
    button.classList.add('playing');
  }
}

function updateFloatingButton(state) {
  const icon = document.getElementById('floating-tts-icon');
  if (!icon) return;
  
  if (state === 'play' || state === 'resume') {
    icon.textContent = '▶';
  } else if (state === 'pause') {
    icon.textContent = '⏸';
  }
}

function updateFloatingStatus(text) {
  const status = document.getElementById('floating-tts-status');
  if (status) {
    status.textContent = text;
  }
}

// ===== CLEANUP AND ERROR HANDLING =====

// Stop on page unload
window.addEventListener('beforeunload', () => {
  console.log('🔄 Page unloading, cleanup...');
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  stopReading();
});

// Pause when tab hidden (optional, can be annoying)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isPlaying && !isPaused) {
    console.log('👁 Tab hidden, auto-pausing...');
    pauseReading();
  }
});

// Stop on route change (if using filters)
if (typeof applyFilters !== 'undefined') {
  const originalApplyFilters = applyFilters;
  applyFilters = function() {
    stopReading();
    originalApplyFilters();
    setTimeout(() => calculateReadingTime(), 200);
  };
}

console.log('✅ TTS module loaded');