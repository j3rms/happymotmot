const memories = [
  {
    month: 'Month 1',
    title: 'Our First Monthsary',
    date: 'March 14, 2026',
    image: 'images/month1.svg',
    music: 'music/month1.mp3',
    letter: [
      'My love, this first month with you has felt like opening a tiny treasure chest full of gentle, glowing moments. Every laugh, every shared silence, and every little ordinary thing became something sacred because you were there beside me.',
      'I keep thinking about the way your presence makes the world feel softer, warmer, and more beautiful. Even the smallest days feel magical when I get to live them with you. I am so grateful for this beginning, and I cannot wait to fill many more months with our love.',
      'Thank you for being my comfort, my joy, and the sweetest part of my everyday. I will hold this month close to my heart forever.'
    ]
  },
  {
    month: 'Month 2',
    title: 'A Soft Evening in Bloom',
    date: 'April 14, 2026',
    image: 'images/month2.svg',
    music: 'music/month2.mp3',
    letter: [
      'Another month, another page of us—still unfolding in the most beautiful way. I love how our story has already become something tender and timeless, like a handwritten letter that only grows more precious with each reread.',
      'You make my heart feel calm and full at the same time. The way you love me, the way you stay, the way your smile turns ordinary evenings into something I want to remember forever. I hope you know how deeply I adore you.',
      'If I could, I would keep choosing you in every season, every silence, and every future. Thank you for being my favorite person to love.'
    ]
  }
];

const coverPage = document.getElementById('coverPage');
const scrapbookApp = document.getElementById('scrapbookApp');
const openScrapbookBtn = document.getElementById('openScrapbookBtn');
const scrapbookViewer = document.getElementById('scrapbookViewer');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageCounter = document.getElementById('pageCounter');
const musicTitle = document.getElementById('musicTitle');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTime = document.getElementById('currentTime');
const volumeControl = document.getElementById('volumeControl');

let currentPageIndex = 0;
let isScrapbookOpen = false;
let playbackActive = false;
let playbackTimer = null;
let progressTimer = null;
let playbackStart = 0;
let playbackDuration = 18;
let elapsedTime = 0;
let musicContext = null;
let masterGain = null;
let currentOscillators = [];

function init() {
  bindEvents();
  startAmbientMusic();
}

function bindEvents() {
  openScrapbookBtn.addEventListener('click', openScrapbook);
  prevPageBtn.addEventListener('click', () => changePage(-1));
  nextPageBtn.addEventListener('click', () => changePage(1));
  playPauseBtn.addEventListener('click', togglePlayback);
  volumeControl.addEventListener('input', handleVolumeChange);
  window.addEventListener('keydown', (event) => {
    if (!isScrapbookOpen) return;
    if (event.key === 'ArrowLeft') changePage(-1);
    if (event.key === 'ArrowRight') changePage(1);
  });
}

function openScrapbook() {
  coverPage.classList.add('is-closing');
  setTimeout(() => {
    coverPage.hidden = true;
    scrapbookApp.hidden = false;
    scrapbookApp.classList.add('visible');
    isScrapbookOpen = true;
    renderPage(0);
    updateNavigation();
    startPageMusic(0);
    stopAmbientMusic();
  }, 850);
}

function changePage(direction) {
  const nextIndex = currentPageIndex + direction;
  if (nextIndex < 0 || nextIndex >= memories.length) return;

  scrapbookViewer.classList.remove('visible');
  currentPageIndex = nextIndex;
  renderPage(currentPageIndex);
  updateNavigation();
  startPageMusic(currentPageIndex);
}

function renderPage(index) {
  const memory = memories[index];
  scrapbookViewer.innerHTML = '';

  const leftPage = document.createElement('article');
  leftPage.className = 'page page-left';

  const polaroid = document.createElement('div');
  polaroid.className = 'polaroid-card';
  polaroid.innerHTML = `
    <span class="tape">✂</span>
    <div class="polaroid-image">
      <img src="${memory.image}" alt="${memory.title}" />
    </div>
    <div class="polaroid-caption">${memory.date}</div>
  `;

  const heading = document.createElement('div');
  heading.className = 'page-heading';
  heading.innerHTML = `
    <p class="page-month">${memory.month}</p>
    <h2>${memory.title}</h2>
    <p class="page-date">${memory.date}</p>
  `;

  leftPage.appendChild(polaroid);
  leftPage.appendChild(heading);
  addDecorations(leftPage, index);

  const rightPage = document.createElement('article');
  rightPage.className = 'page page-right';

  const letterCard = document.createElement('div');
  letterCard.className = 'letter-card';
  letterCard.innerHTML = `
    <div class="letter-quote">“</div>
    ${memory.letter.map((paragraph) => `<p>${paragraph}</p>`).join('')}
    <div class="signature">Forever yours,<br />Jeremy ❤️</div>
  `;

  rightPage.appendChild(letterCard);
  addDecorations(rightPage, index + 3);

  scrapbookViewer.appendChild(leftPage);
  scrapbookViewer.appendChild(rightPage);
}

function addDecorations(target, seed) {
  const symbols = ['🌸', '🍃', '✨', '💗', '🦋', '🎀', '❀', '🌼'];
  const count = 5 + (seed % 3);

  for (let i = 0; i < count; i += 1) {
    const decor = document.createElement('div');
    decor.className = 'decor-item';
    decor.textContent = symbols[(seed + i) % symbols.length];
    decor.style.left = `${8 + ((seed + i) * 11) % 82}%`;
    decor.style.top = `${10 + ((seed + i) * 14) % 75}%`;
    decor.style.fontSize = `${0.95 + ((seed + i) % 3) * 0.25}rem`;
    target.appendChild(decor);
  }
}

function updateNavigation() {
  const total = memories.length;
  prevPageBtn.hidden = currentPageIndex === 0;
  nextPageBtn.hidden = currentPageIndex === total - 1;
  pageCounter.textContent = `${memories[currentPageIndex].month} of ${total}`;
}

function startAmbientMusic() {
  if (!musicContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    musicContext = new AudioContextClass();
    masterGain = musicContext.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(musicContext.destination);
  }

  playbackActive = true;
  playbackDuration = 16;
  playbackStart = musicContext.currentTime;
  elapsedTime = 0;
  startMusicLoop([196, 220, 246, 261], 0.8, 'sine');
  updatePlaybackUI();
}

function stopAmbientMusic() {
  clearInterval(playbackTimer);
  clearInterval(progressTimer);
  playbackActive = false;
  stopOscillators();
}

function startPageMusic(index) {
  stopAmbientMusic();
  const memory = memories[index];
  musicTitle.textContent = memory.month;

  if (!musicContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    musicContext = new AudioContextClass();
    masterGain = musicContext.createGain();
    masterGain.gain.value = Number(volumeControl.value);
    masterGain.connect(musicContext.destination);
  }

  playbackActive = true;
  playbackDuration = 14;
  playbackStart = Date.now();
  elapsedTime = 0;

  const pattern = index === 0
    ? [261, 329, 392, 440]
    : [220, 277, 330, 392];

  startMusicLoop(pattern, 1.1, 'triangle');
  updatePlaybackUI();
}

function startMusicLoop(pattern, interval, waveform) {
  stopOscillators();
  let step = 0;

  const playStep = () => {
    const frequency = pattern[step % pattern.length];
    const now = musicContext.currentTime;
    const oscillator = musicContext.createOscillator();
    const gainNode = musicContext.createGain();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency + 8, now + 0.6);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 0.8);
    currentOscillators.push({ oscillator, gainNode });
    step += 1;
  };

  playStep();
  playbackTimer = setInterval(playStep, interval * 1000);

  progressTimer = setInterval(() => {
    if (!playbackActive) return;
    elapsedTime = (Date.now() - playbackStart) / 1000;
    if (elapsedTime >= playbackDuration) {
      elapsedTime = 0;
      playbackStart = Date.now();
    }
    updatePlaybackUI();
  }, 200);
}

function stopOscillators() {
  currentOscillators.forEach(({ oscillator }) => {
    try {
      oscillator.stop();
    } catch (error) {
      // Ignore already stopped nodes.
    }
  });
  currentOscillators = [];
}

function togglePlayback() {
  if (!playbackActive) {
    if (isScrapbookOpen) {
      startPageMusic(currentPageIndex);
    } else {
      startAmbientMusic();
    }
    playPauseBtn.textContent = '⏸';
    return;
  }

  playbackActive = false;
  clearInterval(playbackTimer);
  clearInterval(progressTimer);
  playPauseBtn.textContent = '▶';
}

function handleVolumeChange(event) {
  const value = Number(event.target.value);
  if (masterGain) {
    masterGain.gain.setTargetAtTime(value, musicContext.currentTime, 0.05);
  }
}

function updatePlaybackUI() {
  const progress = Math.min(100, (elapsedTime / playbackDuration) * 100);
  progressBar.value = progress;
  currentTime.textContent = formatTime(elapsedTime);
  playPauseBtn.textContent = playbackActive ? '⏸' : '▶';
}

function formatTime(value) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

init();
