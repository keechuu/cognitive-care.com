// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  setupPasswordToggle();
  setupSpeechGuidance();
  setupModeSwitcher();
  setupSidebarNavigation();
  setupMobileDrawer();
  setupLoginForm();
  setupClock();
  renderGamesGoal();
  renderProgressMetrics();
});

// 1. Password Visibility Toggle
function setupPasswordToggle() {
  const passwordInput = document.getElementById('password-input');
  const toggleBtn = document.getElementById('toggle-password-btn');
  const eyeIcon = document.getElementById('eye-icon');

  if (!toggleBtn || !passwordInput || !eyeIcon) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

    // Update Lucide icon
    eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

// 2. Web Speech API - Cognitive Accessibility Voice Guidance
function speak(text, element = null) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Friendly, clear pacing
  utterance.pitch = 1.0;

  if (element) {
    element.classList.add('audio-speaking');
    utterance.onend = () => element.classList.remove('audio-speaking');
    utterance.onerror = () => element.classList.remove('audio-speaking');
  }

  window.speechSynthesis.speak(utterance);
}

function setupSpeechGuidance() {
  // Label: Email or Phone
  const emailLabel = document.getElementById('label-email');
  if (emailLabel) {
    emailLabel.addEventListener('click', (e) => {
      e.preventDefault();
      speak('Email or Phone Number. Please enter the email address or phone number registered with your Cognitive Care account.', emailLabel);
    });
  }

  // Label: Password
  const passwordLabel = document.getElementById('label-password');
  if (passwordLabel) {
    passwordLabel.addEventListener('click', (e) => {
      e.preventDefault();
      speak('Password. Please enter your secret account password.', passwordLabel);
    });
  }

  // Label: Remember Me
  const rememberLabel = document.getElementById('label-remember');
  if (rememberLabel) {
    rememberLabel.addEventListener('click', () => {
      speak('Remember me. Check this box if you want this device to keep you signed in.', rememberLabel);
    });
  }

  // Link: Forgot Password
  const forgotLink = document.getElementById('forgot-password-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      speak('Forgot password? Click here to request a password reset link sent to your registered email or phone.', forgotLink);
    });
  }

  // Bottom Audio Help Button
  const audioHelpBtn = document.getElementById('audio-help-btn');
  if (audioHelpBtn) {
    audioHelpBtn.addEventListener('click', () => {
      speak('Need help logging in? You can click directly on any form label to hear step-by-step guidance. When you are done, click the dark blue Login button, or the light turquoise button to create a new account.', audioHelpBtn);
    });
  }
}

// 3. Mode Switcher (Caregiver <-> Patient)
function setupModeSwitcher() {
  const modeBtn = document.getElementById('mode-switcher-btn');
  const modeLabel = document.getElementById('mode-label');

  if (!modeBtn || !modeLabel) return;

  let currentMode = 'Caregiver';

  modeBtn.addEventListener('click', () => {
    if (currentMode === 'Caregiver') {
      currentMode = 'Patient';
      modeLabel.textContent = 'Mode: Patient';
      speak('Switched to Patient mode');
    } else {
      currentMode = 'Caregiver';
      modeLabel.textContent = 'Mode: Caregiver';
      speak('Switched to Caregiver mode');
    }
  });
}

// 4. Sidebar Navigation
function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      // Only prevent default if it's a dummy anchor
      if (!href || href === '#') {
        e.preventDefault();
      }
      const tabName = item.getAttribute('data-nav');
      if (tabName) {
        speak(`Navigating to ${tabName}`);
      }
    });
  });
}

// 5. Mobile Drawer Toggle
function setupMobileDrawer() {
  const openBtn = document.getElementById('open-sidebar-btn');
  const closeBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (!openBtn || !sidebar || !backdrop) return;

  function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  }

  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }

  openBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
}

// 6. Form Submission & Navigation
function setupLoginForm() {
  const form = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  const createAccountBtn = document.getElementById('create-account-btn');

  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => {
      speak('Account created. Welcome to Cognitive Care!');
      window.location.href = 'home.html';
    });
  }

  if (!form || !loginBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const originalText = loginBtn.innerHTML;

    loginBtn.disabled = true;
    loginBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Signing in...</span>
    `;

    speak('Logging in. Welcome back!');

    setTimeout(() => {
      loginBtn.innerHTML = `<span>Welcome back!</span>`;
      loginBtn.classList.remove('bg-brand-navy');
      loginBtn.classList.add('bg-emerald-600');

      setTimeout(() => {
        window.location.href = 'home.html';
      }, 700);
    }, 1200);
  });
}

// 7. Live Clock for Dashboard
function setupClock() {
  const dateEl = document.getElementById('current-date');
  const timeEl = document.getElementById('current-time');
  if (!dateEl && !timeEl) return;

  function update() {
    const now = new Date();
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  }
  update();
  setInterval(update, 1000);
}

// 8. Progress & Cognitive State Manager (Persisted in localStorage)
const DEFAULT_STATE = {
  dailyGoalCompleted: 0,
  dailyGoalTotal: 3,
  activitiesCompleted: 0,
  averageAccuracy: 0,
  weeklyStreak: 0,
  skills: {
    memory: { score: 0, target: 85, status: 'Not started' },
    attention: { score: 0, target: 80, status: 'Not started' },
    reasoning: { score: 0, target: 80, status: 'Not started' }
  },
  recentGames: []
};

function getCognitiveState() {
  try {
    const saved = localStorage.getItem('cognitive_care_state_v2');
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Error reading localStorage:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveCognitiveState(state) {
  try {
    localStorage.setItem('cognitive_care_state_v2', JSON.stringify(state));
  } catch (err) {
    console.error('Error saving localStorage:', err);
  }
}

function resetCognitiveState() {
  localStorage.removeItem('cognitive_care_state');
  localStorage.removeItem('cognitive_care_state_v2');
  location.reload();
}

// Record a completed game and dynamically advance all metrics from zero
function recordCompletedActivity(gameName, category = 'memory', score = 98) {
  const state = getCognitiveState();

  // 1. Advance activity counter
  state.activitiesCompleted += 1;

  // 2. Advance daily goal
  state.dailyGoalCompleted += 1;

  // 3. Set or update streak and accuracy
  if (state.weeklyStreak === 0) {
    state.weeklyStreak = 1;
  }

  if (state.averageAccuracy === 0) {
    state.averageAccuracy = score;
  } else {
    state.averageAccuracy = Math.min(100, Math.round((state.averageAccuracy + score) / 2));
  }

  // 4. Update the specific skill rating by +30% per activity towards target
  if (state.skills[category]) {
    state.skills[category].score = Math.min(100, state.skills[category].score + 30);
    if (state.skills[category].score >= state.skills[category].target) {
      state.skills[category].status = 'Exceeding goal';
    } else if (state.skills[category].score > 0) {
      state.skills[category].status = 'In progress';
    }
  }

  // 5. Prepend to recent games list
  let iconName = 'layout-grid';
  let bgClass = 'bg-teal-100';
  let textClass = 'text-teal-700';
  if (category === 'reasoning') {
    iconName = 'list-ordered';
    bgClass = 'bg-blue-100';
    textClass = 'text-blue-700';
  } else if (category === 'attention') {
    iconName = 'eye';
    bgClass = 'bg-teal-100';
    textClass = 'text-teal-700';
  }

  state.recentGames.unshift({
    name: gameName,
    score: score,
    time: 'Just now',
    type: category,
    icon: iconName,
    bg: bgClass,
    text: textClass
  });

  // Keep top 6
  if (state.recentGames.length > 6) {
    state.recentGames.pop();
  }

  // Save to persistence
  saveCognitiveState(state);

  // Re-render any active page elements immediately
  renderGamesGoal();
  renderProgressMetrics();

  return state;
}

// Render Daily Goal card on games.html
function renderGamesGoal() {
  const state = getCognitiveState();
  const goalTextEl = document.getElementById('daily-goal-text');
  const goalSubtextEl = document.getElementById('daily-goal-subtext');
  const goalProgressEl = document.getElementById('daily-goal-bar');

  if (!goalTextEl || !goalSubtextEl) return;

  const pct = Math.min(100, Math.round((state.dailyGoalCompleted / state.dailyGoalTotal) * 100));
  goalTextEl.textContent = `Daily Goal: ${state.dailyGoalCompleted} / ${state.dailyGoalTotal} Games`;

  if (state.dailyGoalCompleted >= state.dailyGoalTotal) {
    goalSubtextEl.innerHTML = `<span class="text-emerald-800 font-bold">100% completed today — Goal Achieved! 🎉</span>`;
  } else if (state.dailyGoalCompleted === 0) {
    goalSubtextEl.textContent = `0% completed today • Play 1 game to start!`;
  } else {
    goalSubtextEl.textContent = `${pct}% completed today`;
  }

  if (goalProgressEl) {
    goalProgressEl.style.width = `${pct}%`;
  }
}

// Render all metrics on progress.html
function renderProgressMetrics() {
  const state = getCognitiveState();

  // Top cards
  const actEl = document.getElementById('stat-activities');
  const accEl = document.getElementById('stat-accuracy');
  const streakEl = document.getElementById('stat-streak');

  if (actEl) actEl.textContent = state.activitiesCompleted;
  if (accEl) accEl.textContent = `${state.averageAccuracy}%`;
  if (streakEl) streakEl.textContent = `${state.weeklyStreak} Days`;

  // Skills
  const memoryScore = document.getElementById('score-memory');
  const memoryBar = document.getElementById('bar-memory');
  const memoryStatus = document.getElementById('status-memory');
  if (memoryScore && state.skills.memory) {
    memoryScore.textContent = `${state.skills.memory.score}%`;
    if (memoryBar) memoryBar.style.width = `${state.skills.memory.score}%`;
    if (memoryStatus) memoryStatus.textContent = state.skills.memory.status;
  }

  const attentionScore = document.getElementById('score-attention');
  const attentionBar = document.getElementById('bar-attention');
  const attentionStatus = document.getElementById('status-attention');
  if (attentionScore && state.skills.attention) {
    attentionScore.textContent = `${state.skills.attention.score}%`;
    if (attentionBar) attentionBar.style.width = `${state.skills.attention.score}%`;
    if (attentionStatus) attentionStatus.textContent = state.skills.attention.status;
  }

  const reasoningScore = document.getElementById('score-reasoning');
  const reasoningBar = document.getElementById('bar-reasoning');
  const reasoningStatus = document.getElementById('status-reasoning');
  if (reasoningScore && state.skills.reasoning) {
    reasoningScore.textContent = `${state.skills.reasoning.score}%`;
    if (reasoningBar) reasoningBar.style.width = `${state.skills.reasoning.score}%`;
    if (reasoningStatus) reasoningStatus.textContent = state.skills.reasoning.status;
  }

  // Recent games list
  const recentListEl = document.getElementById('recent-games-list');
  if (recentListEl) {
    if (!state.recentGames || state.recentGames.length === 0) {
      recentListEl.innerHTML = `
        <div class="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <i data-lucide="sparkles" class="w-6 h-6 mx-auto mb-2 text-slate-300"></i>
          No games played yet today.<br>
          <span class="text-slate-600 font-semibold">Play your first exercise to see scores here!</span>
        </div>
      `;
    } else {
      recentListEl.innerHTML = state.recentGames.map(game => `
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/70">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl ${game.bg} ${game.text} flex items-center justify-center">
              <i data-lucide="${game.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="font-bold text-slate-900 text-xs">${game.name}</div>
              <div class="text-[11px] text-slate-400">${game.time}</div>
            </div>
          </div>
          <div class="text-xs font-bold text-slate-900">${game.score}% <span class="text-[10px] font-normal text-slate-400">Score</span></div>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  }
}


