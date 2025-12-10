// ===== GLOBAL NEWSLETTER TTS SYSTEM =====
// FULLY FIXED: Starts properly, restart works, cleanup works

let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isPlaying = false;
let isPaused = false;
let allArticles = [];
let currentArticleIndex = 0;
let voicesLoaded = false;

// Wait for page to fully load
window.addEventListener('load', function() {
  // Give browser time to load voices
  setTimeout(() => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      console.log('TTS voices loaded:', voices.length);
    }
  }, 100);
  
  // Load voices (important for Chrome/Edge)
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      console.log('TTS voices changed, loaded:', speechSynthesis.getVoices().length);
    };
  }
  
  initializeGlobalTTS();
});

function initializeGlobalTTS() {
  const globalPlayButton = document.getElementById('global-play-button');
  const floatingPlayer = document.getElementById('floating-tts-player');
  const floatingControl = document.getElementById('floating-tts-control');
  
  if (!globalPlayButton) {
    console.error('Global play button not found');
    return;
  }
  
  console.log('Initializing TTS system...');
  
  // Calculate reading time
  calculateReadingTime();
  
  // Global play button click
  globalPlayButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Global button clicked. State:', { isPlaying, isPaused });
    
    if (!isPlaying && !isPaused) {
      // Start fresh
      console.log('Starting fresh reading...');
      startNewsletterReading();
    } else if (isPaused) {
      // Resume from pause
      console.log('Resuming...');
      resumeReading();
    } else if (isPlaying) {
      // Pause
      console.log('Pausing...');
      pauseReading();
    }
  });
  
  // Floating player control - handles all states
  if (floatingControl) {
    floatingControl.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Floating control clicked. State:', { isPlaying, isPaused });
      
      if (!isPlaying && !isPaused) {
        // Restart from beginning if stopped
        console.log('Restarting from beginning...');
        startNewsletterReading();
      } else if (isPaused) {
        // Resume from pause
        console.log('Resuming from pause...');
        resumeReading();
      } else if (isPlaying) {
        // Pause
        console.log('Pausing...');
        pauseReading();
      }
    });
  }
  
  // Floating player stop button
  const floatingStop = document.getElementById('floating-tts-stop');
  if (floatingStop) {
    floatingStop.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Stop button clicked');
      stopReading();
    });
  }
  
  // Floating player skip button
  const floatingSkip = document.getElementById('floating-tts-skip');
  if (floatingSkip) {
    floatingSkip.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Skip button clicked');
      skipToNextArticle();
    });
  }
  
  // Stop on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (isPlaying || isPaused)) {
      console.log('Escape pressed, stopping...');
      stopReading();
    }
  });
  
  console.log('TTS system initialized');
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
  
  console.log('Total words:', totalWords, 'Reading time:', minutes, 'min');
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
  
  console.log('Gathered articles:', allArticles.length);
  return allArticles;
}

function startNewsletterReading() {
  console.log('Starting newsletter reading...');
  
  // First, ensure any previous speech is stopped
  if (speechSynthesis.speaking) {
    console.log('Canceling previous speech...');
    speechSynthesis.cancel();
  }
  
  gatherAllArticles();
  
  if (allArticles.length === 0) {
    alert('No articles to read');
    return;
  }
  
  // Ensure voices are loaded
  let voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    console.log('No voices loaded yet, waiting...');
    // Try to trigger voice loading
    speechSynthesis.getVoices();
    // Wait a bit and try again
    setTimeout(() => {
      voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.error('Still no voices available');
        alert('Text-to-speech voices not available. Please try again.');
        return;
      }
      voicesLoaded = true;
      console.log('Voices now available:', voices.length);
      continueStarting();
    }, 500);
    return;
  }
  
  voicesLoaded = true;
  continueStarting();
}

function continueStarting() {
  console.log('Continuing start...');
  
  currentArticleIndex = 0;
  isPlaying = true;
  isPaused = false;
  
  // Show floating player
  const floatingPlayer = document.getElementById('floating-tts-player');
  if (floatingPlayer) {
    floatingPlayer.classList.remove('hidden');
    console.log('Floating player shown');
  }
  
  // Update buttons
  updateGlobalButton('pause');
  updateFloatingButton('pause');
  
  // Start reading with a small delay to ensure everything is ready
  setTimeout(() => {
    console.log('Starting to read first article...');
    readNextArticle();
  }, 100);
}

function readNextArticle() {
  console.log('Reading article', currentArticleIndex + 1, 'of', allArticles.length);
  
  if (currentArticleIndex >= allArticles.length) {
    console.log('Finished all articles');
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
  console.log('Creating utterance for:', textToRead.substring(0, 50) + '...');
  
  currentUtterance = new SpeechSynthesisUtterance(textToRead);
  
  // Select voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = selectBestVoice(voices);
  if (preferredVoice) {
    currentUtterance.voice = preferredVoice;
    console.log('Using voice:', preferredVoice.name);
  }
  
  // Settings
  currentUtterance.rate = 0.95;
  currentUtterance.pitch = 1.1;
  currentUtterance.volume = 1.0;
  
  currentUtterance.onstart = () => {
    console.log('Speech started for article', currentArticleIndex + 1);
  };
  
  currentUtterance.onend = () => {
    console.log('Speech ended for article', currentArticleIndex + 1);
    currentArticleIndex++;
    // Small delay before next article
    setTimeout(() => {
      readNextArticle();
    }, 500);
  };
  
  currentUtterance.onerror = (event) => {
    console.error('Speech error:', event);
    currentArticleIndex++;
    readNextArticle();
  };
  
  console.log('Speaking...');
  speechSynthesis.speak(currentUtterance);
}

function selectBestVoice(voices) {
  if (!voices || voices.length === 0) return null;
  
  const voicePriority = [
    { name: 'Google US English', gender: 'female' },
    { name: 'Google UK English Female', gender: 'female' },
    { name: 'Microsoft Zira', lang: 'en-US' },
    { name: 'Microsoft Susan', lang: 'en-GB' },
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Karen', lang: 'en-AU' },
    { name: 'Moira', lang: 'en-IE' },
    { name: 'Alex', lang: 'en-US' },
    { name: 'Fiona', lang: 'en-GB' },
  ];
  
  for (const preferred of voicePriority) {
    const voice = voices.find(v => 
      v.name.includes(preferred.name) || 
      (preferred.lang && v.lang.includes(preferred.lang))
    );
    if (voice) return voice;
  }
  
  const femaleVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('female') || 
     v.name.toLowerCase().includes('woman') ||
     v.name.includes('Zira') ||
     v.name.includes('Susan'))
  );
  if (femaleVoice) return femaleVoice;
  
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  return englishVoice || voices[0];
}

function pauseReading() {
  console.log('Pausing reading...');
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    isPaused = true;
    isPlaying = true;
    updateGlobalButton('resume');
    updateFloatingButton('resume');
    updateFloatingStatus('Paused');
    console.log('Paused successfully');
  }
}

function resumeReading() {
  console.log('Resuming reading...');
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    isPaused = false;
    isPlaying = true;
    updateGlobalButton('pause');
    updateFloatingButton('pause');
    updateFloatingStatus(`Reading article ${currentArticleIndex + 1} of ${allArticles.length}`);
    console.log('Resumed successfully');
  }
}

function stopReading() {
  console.log('Stopping reading...');
  
  // Cancel speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Reset all state
  isPlaying = false;
  isPaused = false;
  currentArticleIndex = 0;
  currentUtterance = null;
  
  // Hide floating player
  const floatingPlayer = document.getElementById('floating-tts-player');
  if (floatingPlayer) {
    floatingPlayer.classList.add('hidden');
  }
  
  // Reset buttons
  updateGlobalButton('play');
  updateFloatingButton('play');
  
  console.log('Stopped successfully. State reset.');
}

function skipToNextArticle() {
  console.log('Skipping to next article...');
  
  if (!isPlaying && !isPaused) return;
  
  // Stop current speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Move to next article
  currentArticleIndex++;
  
  // If at end, stop
  if (currentArticleIndex >= allArticles.length) {
    console.log('No more articles, stopping');
    stopReading();
    return;
  }
  
  // Reset pause state
  if (isPaused) {
    isPaused = false;
    isPlaying = true;
    updateGlobalButton('pause');
    updateFloatingButton('pause');
  }
  
  // Read next
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
  
  if (state === 'play') {
    icon.textContent = '▶';
  } else if (state === 'pause') {
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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  console.log('Page unloading, cleaning up TTS...');
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  stopReading();
});

// Pause when tab hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isPlaying && !isPaused) {
    console.log('Tab hidden, pausing...');
    pauseReading();
  }
});

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