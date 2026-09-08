// Initialize Lucide Icons
document.addEventListener('pointerdown', unlockAlarmAudio, { once: true });

document.addEventListener('DOMContentLoaded', () => {
  applyAccessibilitySettings();
  if (window.lucide) {
    window.lucide.createIcons();
  }
  setupPasswordToggle();
  setupSpeechGuidance();
  setupSidebarNavigation();
  setupMobileDrawer();
  setupLoginForm();
  setupClock();
  renderGamesGoal();
  renderProgressMetrics();
  setupCaregiverPhotoUpload();
  setupCaregiverEditModal();
  setupProfilePage();
  setupRemindersModal();
  setupSettingsPage();
  setupMemoryAlbum();
  setupReminderAlarms();
});

// 0. Accessibility Settings (Voice Guidance / Larger Text / High Contrast)
const SETTINGS_KEY = 'cognitive_care_settings';
const DEFAULT_SETTINGS = { voiceGuidance: true, largerText: false, highContrast: false };

function getSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved));
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  return Object.assign({}, DEFAULT_SETTINGS);
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

// Injects/updates a stylesheet for high contrast + larger text, and applies
// the relevant classes to <html>. Runs on every page load.
function applyAccessibilitySettings() {
  const settings = getSettings();
  const html = document.documentElement;

  html.classList.toggle('a11y-larger-text', !!settings.largerText);
  html.classList.toggle('a11y-high-contrast', !!settings.highContrast);

  if (!document.getElementById('a11y-style')) {
    const style = document.createElement('style');
    style.id = 'a11y-style';
    style.textContent = `
      html.a11y-larger-text { font-size: 118%; }
      html.a11y-high-contrast body { background-color: #ffffff !important; color: #000000 !important; }
      html.a11y-high-contrast .text-slate-400,
      html.a11y-high-contrast .text-slate-500,
      html.a11y-high-contrast .text-slate-600 { color: #1e293b !important; }
      html.a11y-high-contrast .bg-brand-canvas,
      html.a11y-high-contrast .bg-brand-sidebar,
      html.a11y-high-contrast .bg-slate-50,
      html.a11y-high-contrast .bg-white { background-color: #ffffff !important; }
      html.a11y-high-contrast .border-slate-100,
      html.a11y-high-contrast .border-slate-200,
      html.a11y-high-contrast .border-brand-borderLight { border-color: #000000 !important; }
      html.a11y-high-contrast .nav-item { border: 1.5px solid #00000022; }
      html.a11y-high-contrast button,
      html.a11y-high-contrast a { text-decoration-thickness: 2px; }
    `;
    document.head.appendChild(style);
  }
}

function setupSettingsPage() {
  const voiceToggle = document.getElementById('toggle-voice-guidance');
  const largerTextToggle = document.getElementById('toggle-larger-text');
  const contrastToggle = document.getElementById('toggle-high-contrast');
  if (!voiceToggle && !largerTextToggle && !contrastToggle) return; // not the settings page

  const settings = getSettings();

  function paintToggle(btn, key) {
    if (!btn) return;
    btn.setAttribute('aria-checked', settings[key] ? 'true' : 'false');
  }
  paintToggle(voiceToggle, 'voiceGuidance');
  paintToggle(largerTextToggle, 'largerText');
  paintToggle(contrastToggle, 'highContrast');

  [voiceToggle, largerTextToggle, contrastToggle].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      const current = getSettings();
      current[key] = !current[key];
      saveSettings(current);
      btn.setAttribute('aria-checked', current[key] ? 'true' : 'false');
      applyAccessibilitySettings();
      if (key === 'voiceGuidance' && current[key]) {
        speak('Voice guidance turned on.');
      }
    });
  });

  // Daily goal
  const dailyGoalInput = document.getElementById('daily-goal-input');
  const dailyGoalSaveBtn = document.getElementById('daily-goal-save-btn');
  const dailyGoalConfirmation = document.getElementById('daily-goal-confirmation');
  if (dailyGoalInput) {
    const state = getCognitiveState();
    dailyGoalInput.value = state.dailyGoalTotal || 3;
  }
  if (dailyGoalSaveBtn) {
    dailyGoalSaveBtn.addEventListener('click', () => {
      let value = parseInt(dailyGoalInput.value, 10);
      if (isNaN(value) || value < 1) value = 1;
      if (value > 10) value = 10;
      dailyGoalInput.value = value;

      const state = getCognitiveState();
      state.dailyGoalTotal = value;
      saveCognitiveState(state);
      renderGamesGoal();

      if (dailyGoalConfirmation) {
        dailyGoalConfirmation.classList.remove('hidden');
        setTimeout(() => dailyGoalConfirmation.classList.add('hidden'), 2500);
      }
      speak(`Daily goal set to ${value} games.`);
    });
  }

  // Caregiver password change
  const currentPwInput = document.getElementById('settings-current-password');
  const newPwInput = document.getElementById('settings-new-password');
  const pwSaveBtn = document.getElementById('settings-password-save-btn');
  const pwError = document.getElementById('settings-password-error');
  const pwSuccess = document.getElementById('settings-password-success');

  if (pwSaveBtn) {
    pwSaveBtn.addEventListener('click', () => {
      pwError.classList.add('hidden');
      pwSuccess.classList.add('hidden');

      const current = currentPwInput.value;
      const next = newPwInput.value;

      if (current !== getCaregiverEditPassword()) {
        pwError.textContent = 'Current password is incorrect.';
        pwError.classList.remove('hidden');
        return;
      }
      if (!next || next.length < 4) {
        pwError.textContent = 'New password should be at least 4 characters.';
        pwError.classList.remove('hidden');
        return;
      }

      let account = null;
      try {
        const saved = localStorage.getItem(CAREGIVER_ACCOUNT_KEY);
        if (saved) account = JSON.parse(saved);
      } catch (err) {
        console.error('Error reading caregiver account:', err);
      }
      const email = account && account.email ? account.email : '';
      try {
        localStorage.setItem(CAREGIVER_ACCOUNT_KEY, JSON.stringify({ email, password: next }));
      } catch (err) {
        console.error('Error saving caregiver account:', err);
      }

      currentPwInput.value = '';
      newPwInput.value = '';
      pwSuccess.classList.remove('hidden');
      setTimeout(() => pwSuccess.classList.add('hidden'), 2500);
      speak('Caregiver password updated.');
    });
  }

  // Reset progress & game levels
  const resetProgressBtn = document.getElementById('reset-progress-btn');
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener('click', () => {
      if (!confirm('This will reset all game progress, scores, and difficulty levels. Continue?')) return;
      localStorage.removeItem('cognitive_care_state');
      localStorage.removeItem('cognitive_care_state_v2');
      localStorage.removeItem(GAME_LEVELS_KEY);
      speak('Progress and game levels have been reset.');
      location.reload();
    });
  }

  // Clear memory album
  const clearAlbumBtn = document.getElementById('clear-album-btn');
  if (clearAlbumBtn) {
    clearAlbumBtn.addEventListener('click', () => {
      if (!confirm('This will permanently delete all photos and videos in the Memory Album. Continue?')) return;
      localStorage.removeItem(ALBUM_KEY);
      speak('Memory album cleared.');
      location.reload();
    });
  }
}

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

  // Respect the Voice Guidance setting from the Settings page
  try {
    const settings = getSettings();
    if (settings.voiceGuidance === false) return;
  } catch (err) {
    // If settings can't be read, fall back to speaking normally
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
const CAREGIVER_ACCOUNT_KEY = 'cognitive_care_caregiver_account';

function setupLoginForm() {
  const form = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  const createAccountBtn = document.getElementById('create-account-btn');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');

  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => {
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (loginError) loginError.classList.add('hidden');

      if (!email || !password) {
        if (loginError) {
          loginError.textContent = 'Please enter an email/phone and password to create an account.';
          loginError.classList.remove('hidden');
        }
        return;
      }
      if (password.length < 4) {
        if (loginError) {
          loginError.textContent = 'Password should be at least 4 characters.';
          loginError.classList.remove('hidden');
        }
        return;
      }

      try {
        localStorage.setItem(CAREGIVER_ACCOUNT_KEY, JSON.stringify({ email, password }));
      } catch (err) {
        console.error('Error saving caregiver account:', err);
      }

      speak('Account created. This password will now be used to edit the caregiver phone number. Welcome to Cognitive Care!');
      window.location.href = 'home.html';
    });
  }

  if (!form || !loginBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (loginError) loginError.classList.add('hidden');

    // If a caregiver account exists, require matching credentials
    let account = null;
    try {
      const saved = localStorage.getItem(CAREGIVER_ACCOUNT_KEY);
      if (saved) account = JSON.parse(saved);
    } catch (err) {
      console.error('Error reading caregiver account:', err);
    }

    if (account) {
      const enteredEmail = emailInput ? emailInput.value.trim() : '';
      const enteredPassword = passwordInput ? passwordInput.value : '';
      if (enteredEmail !== account.email || enteredPassword !== account.password) {
        if (loginError) {
          loginError.textContent = 'Incorrect email/phone or password.';
          loginError.classList.remove('hidden');
        }
        speak('Incorrect email or password. Please try again.');
        return;
      }
    }

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


// 6b. Caregiver Photo Upload (Home page)
const CAREGIVER_PHOTO_KEY = 'cognitive_care_caregiver_photo';

function renderCaregiverPhoto(dataUrl) {
  const box = document.getElementById('caregiver-photo-box');
  if (!box) return;

  if (dataUrl) {
    box.innerHTML = `<img src="${dataUrl}" alt="Caregiver photo" class="w-full h-full object-cover rounded-2xl">`;
    box.classList.remove('border-dashed', 'border-rose-300', 'bg-white');
    box.classList.add('border-solid', 'border-rose-200');
  } else {
    box.innerHTML = `
      <i data-lucide="camera" class="w-5 h-5 text-slate-400 mb-0.5"></i>
      <span class="text-[10px] font-medium text-slate-500">Add Photo</span>
    `;
    box.classList.add('border-dashed', 'border-rose-300', 'bg-white');
    box.classList.remove('border-solid', 'border-rose-200');
    if (window.lucide) window.lucide.createIcons();
  }
}

function setupCaregiverPhotoUpload() {
  const box = document.getElementById('caregiver-photo-box');
  const input = document.getElementById('caregiver-photo-input');
  if (!box || !input) return;

  // Load any previously saved photo
  try {
    const saved = localStorage.getItem(CAREGIVER_PHOTO_KEY);
    if (saved) renderCaregiverPhoto(saved);
  } catch (err) {
    console.error('Error reading saved caregiver photo:', err);
  }

  // Clicking the box opens the file picker
  box.addEventListener('click', () => input.click());

  // When a file is chosen, preview it and persist it
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPG, PNG, etc).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      renderCaregiverPhoto(dataUrl);
      try {
        localStorage.setItem(CAREGIVER_PHOTO_KEY, dataUrl);
      } catch (err) {
        console.error('Error saving caregiver photo (it may be too large):', err);
      }
    };
    reader.readAsDataURL(file);
  });
}

// 6c. Caregiver Contact Edit (password protected)
// The password used here comes from the caregiver account created at signup
// (index.html "Create an Account"). If no account has been created yet, a
// fallback default is used so the feature is still testable.
const CAREGIVER_EDIT_FALLBACK_PASSWORD = 'caregiver123';
const CAREGIVER_INFO_KEY = 'cognitive_care_caregiver_info';

function getCaregiverEditPassword() {
  try {
    const saved = localStorage.getItem(CAREGIVER_ACCOUNT_KEY);
    if (saved) {
      const account = JSON.parse(saved);
      if (account && account.password) return account.password;
    }
  } catch (err) {
    console.error('Error reading caregiver account for edit password:', err);
  }
  return CAREGIVER_EDIT_FALLBACK_PASSWORD;
}

function sanitizePhoneForTel(phone) {
  let digits = phone.replace(/[^\d+]/g, '');
  if (!digits.startsWith('+')) {
    // Assume US number if 10 digits given without country code
    digits = digits.length === 10 ? `+1${digits}` : `+${digits}`;
  }
  return digits;
}

function renderCaregiverInfo() {
  const phoneDisplay = document.getElementById('caregiver-phone-display');
  const nameDisplay = document.getElementById('caregiver-name-display');
  const callBtn = document.getElementById('caregiver-call-btn');
  if (!phoneDisplay || !nameDisplay || !callBtn) return;

  try {
    const saved = localStorage.getItem(CAREGIVER_INFO_KEY);
    if (saved) {
      const info = JSON.parse(saved);
      if (info.phone) {
        phoneDisplay.textContent = info.phone;
        callBtn.setAttribute('href', `tel:${sanitizePhoneForTel(info.phone)}`);
      }
      if (info.name) {
        nameDisplay.textContent = info.name;
      }
    }
  } catch (err) {
    console.error('Error loading saved caregiver info:', err);
  }
}

function setupCaregiverEditModal() {
  const editBtn = document.getElementById('edit-caregiver-btn');
  const backdrop = document.getElementById('caregiver-edit-backdrop');
  const passwordScreen = document.getElementById('caregiver-password-screen');
  const editScreen = document.getElementById('caregiver-edit-screen');
  const passwordInput = document.getElementById('caregiver-password-input');
  const passwordError = document.getElementById('caregiver-password-error');
  const passwordSubmitBtn = document.getElementById('caregiver-password-submit-btn');
  const passwordCancelBtn = document.getElementById('caregiver-password-cancel-btn');
  const nameInput = document.getElementById('caregiver-name-input');
  const phoneInput = document.getElementById('caregiver-phone-input');
  const editError = document.getElementById('caregiver-edit-error');
  const editSaveBtn = document.getElementById('caregiver-edit-save-btn');
  const editCancelBtn = document.getElementById('caregiver-edit-cancel-btn');

  if (!editBtn || !backdrop) return;

  // Load any previously saved caregiver info on page load
  renderCaregiverInfo();

  function closeModal() {
    backdrop.classList.add('hidden');
    passwordInput.value = '';
    passwordError.classList.add('hidden');
    editError.classList.add('hidden');
    passwordScreen.classList.remove('hidden');
    editScreen.classList.add('hidden');
  }

  function openModal() {
    backdrop.classList.remove('hidden');
    passwordScreen.classList.remove('hidden');
    editScreen.classList.add('hidden');
    passwordInput.value = '';
    passwordError.classList.add('hidden');
    passwordInput.focus();
  }

  function unlockEditScreen() {
    if (passwordInput.value === getCaregiverEditPassword()) {
      // Pre-fill with current displayed values
      const phoneDisplay = document.getElementById('caregiver-phone-display');
      const nameDisplay = document.getElementById('caregiver-name-display');
      nameInput.value = nameDisplay ? nameDisplay.textContent : '';
      phoneInput.value = phoneDisplay ? phoneDisplay.textContent : '';

      passwordScreen.classList.add('hidden');
      editScreen.classList.remove('hidden');
      passwordError.classList.add('hidden');
      nameInput.focus();
    } else {
      passwordError.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  function saveCaregiverInfo() {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    // Basic validation: require a name and at least 7 digits in the phone number
    const digitCount = (phone.match(/\d/g) || []).length;
    if (!name || digitCount < 7) {
      editError.classList.remove('hidden');
      return;
    }

    try {
      localStorage.setItem(CAREGIVER_INFO_KEY, JSON.stringify({ name, phone }));
    } catch (err) {
      console.error('Error saving caregiver info:', err);
    }

    renderCaregiverInfo();
    if (window.lucide) window.lucide.createIcons();
    closeModal();
    speak('Caregiver contact information updated.');
  }

  editBtn.addEventListener('click', openModal);
  passwordCancelBtn.addEventListener('click', closeModal);
  editCancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  passwordSubmitBtn.addEventListener('click', unlockEditScreen);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlockEditScreen();
  });

  editSaveBtn.addEventListener('click', saveCaregiverInfo);
  phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveCaregiverInfo();
  });
}

// 6d. Profile Page (photo upload + editable personal info)
const PROFILE_PHOTO_KEY = 'cognitive_care_profile_photo';
const PROFILE_INFO_KEY = 'cognitive_care_profile_info';

function renderProfilePhoto(dataUrl) {
  const box = document.getElementById('profile-photo-box');
  if (!box) return;

  if (dataUrl) {
    box.innerHTML = `<img src="${dataUrl}" alt="Profile photo" class="w-full h-full object-cover rounded-full">`;
    box.classList.remove('border-dashed', 'border-slate-300', 'bg-slate-100');
    box.classList.add('border-solid', 'border-slate-200');
  } else {
    box.innerHTML = `
      <i data-lucide="camera" class="w-6 h-6 text-slate-400 mb-1"></i>
      <span class="text-[10px] font-medium text-slate-500">Add Photo</span>
    `;
    box.classList.add('border-dashed', 'border-slate-300', 'bg-slate-100');
    box.classList.remove('border-solid', 'border-slate-200');
    if (window.lucide) window.lucide.createIcons();
  }
}

function setupProfilePage() {
  const photoBox = document.getElementById('profile-photo-box');
  const photoInput = document.getElementById('profile-photo-input');
  const nameInput = document.getElementById('profile-name-input');
  const emailInput = document.getElementById('profile-email-input');
  const phoneInput = document.getElementById('profile-phone-input');
  const dobInput = document.getElementById('profile-dob-input');
  const notesInput = document.getElementById('profile-notes-input');
  const nameDisplay = document.getElementById('profile-name-display');
  const emailDisplay = document.getElementById('profile-email-display');
  const modeDisplay = document.getElementById('profile-mode-display');
  const streakDisplay = document.getElementById('profile-streak-display');
  const activitiesDisplay = document.getElementById('profile-activities-display');
  const saveBtn = document.getElementById('profile-save-btn');
  const saveConfirmation = document.getElementById('profile-save-confirmation');

  // Only run this setup on the profile page
  if (!photoBox || !photoInput || !saveBtn) return;

  // Load saved photo
  try {
    const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);
    if (savedPhoto) renderProfilePhoto(savedPhoto);
  } catch (err) {
    console.error('Error reading saved profile photo:', err);
  }

  // Load saved personal info into the form + summary card
  try {
    const savedInfo = localStorage.getItem(PROFILE_INFO_KEY);
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      if (nameInput) nameInput.value = info.name || '';
      if (emailInput) emailInput.value = info.email || '';
      if (phoneInput) phoneInput.value = info.phone || '';
      if (dobInput) dobInput.value = info.dob || '';
      if (notesInput) notesInput.value = info.notes || '';
      if (info.name && nameDisplay) nameDisplay.textContent = info.name;
      if (info.email && emailDisplay) emailDisplay.textContent = info.email;
    }
  } catch (err) {
    console.error('Error reading saved profile info:', err);
  }

  // Populate the read-only summary stats from the shared cognitive state
  const state = getCognitiveState();
  if (streakDisplay) streakDisplay.textContent = `${state.weeklyStreak} Days`;
  if (activitiesDisplay) activitiesDisplay.textContent = state.activitiesCompleted;
  if (modeDisplay) {
    try {
      const savedMode = localStorage.getItem('cognitive_care_current_mode');
      modeDisplay.textContent = savedMode || 'Patient';
    } catch (err) {
      modeDisplay.textContent = 'Patient';
    }
  }

  // Photo upload
  photoBox.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPG, PNG, etc).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      renderProfilePhoto(dataUrl);
      try {
        localStorage.setItem(PROFILE_PHOTO_KEY, dataUrl);
      } catch (err) {
        console.error('Error saving profile photo (it may be too large):', err);
      }
    };
    reader.readAsDataURL(file);
  });

  // Save personal info
  saveBtn.addEventListener('click', () => {
    const info = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      dob: dobInput.value,
      notes: notesInput.value.trim()
    };

    try {
      localStorage.setItem(PROFILE_INFO_KEY, JSON.stringify(info));
    } catch (err) {
      console.error('Error saving profile info:', err);
    }

    if (info.name && nameDisplay) nameDisplay.textContent = info.name;
    if (info.email && emailDisplay) emailDisplay.textContent = info.email;

    if (saveConfirmation) {
      saveConfirmation.classList.remove('hidden');
      setTimeout(() => saveConfirmation.classList.add('hidden'), 2500);
    }
    speak('Profile updated successfully.');
  });
}

// 6e. Reminders (Home page quick action)
const REMINDERS_KEY = 'cognitive_care_reminders';

function getReminders() {
  try {
    const saved = localStorage.getItem(REMINDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Error reading reminders:', err);
  }
  return [];
}

function saveReminders(reminders) {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Error saving reminders:', err);
  }
}

function formatReminderTime(time) {
  if (!time) return '';
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

function renderReminders() {
  const listEl = document.getElementById('reminders-list');
  const badge = document.getElementById('reminders-count-badge');
  if (!listEl) return;

  const reminders = getReminders().sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  if (badge) {
    if (reminders.length > 0) {
      badge.textContent = reminders.length;
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }

  if (reminders.length === 0) {
    listEl.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <i data-lucide="bell-off" class="w-6 h-6 mx-auto mb-2 text-slate-300"></i>
        No reminders yet.<br>
        <span class="text-slate-600 font-semibold">Add one above to get started!</span>
      </div>
    `;
  } else {
    listEl.innerHTML = reminders.map(r => `
      <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <i data-lucide="bell" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="font-bold text-slate-900 text-sm">${r.text}</div>
            ${r.time ? `<div class="text-[11px] text-slate-400">${formatReminderTime(r.time)}</div>` : ''}
          </div>
        </div>
        <button data-id="${r.id}" class="reminder-delete-btn text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors" aria-label="Delete reminder">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

function setupRemindersModal() {
  const card = document.getElementById('set-reminders-card');
  const backdrop = document.getElementById('reminders-backdrop');
  const closeBtn = document.getElementById('reminders-close-btn');
  const textInput = document.getElementById('reminder-text-input');
  const hourInput = document.getElementById('reminder-hour-input');
  const minuteInput = document.getElementById('reminder-minute-input');
  const meridiemInput = document.getElementById('reminder-meridiem-input');
  const addBtn = document.getElementById('reminder-add-btn');
  const listEl = document.getElementById('reminders-list');

  if (!card || !backdrop) return;


  if (hourInput && !hourInput.options.length) {
    for (let h = 1; h <= 12; h++) {
      const option = document.createElement('option');
      option.value = String(h);
      option.textContent = String(h);
      hourInput.appendChild(option);
    }
  }
  if (minuteInput && !minuteInput.options.length) {
    for (let m = 0; m < 60; m++) {
      const value = String(m).padStart(2, '0');
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      minuteInput.appendChild(option);
    }
  }
  if (meridiemInput && !meridiemInput.options.length) {
    ['AM', 'PM'].forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      meridiemInput.appendChild(option);
    });
  }

  renderReminders();

  function openModal() {
    backdrop.classList.remove('hidden');
    textInput.value = '';
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    if (hourInput) hourInput.value = String(h);
    if (minuteInput) minuteInput.value = m;
    if (meridiemInput) meridiemInput.value = ampm;
    textInput.focus();
  }

  function closeModal() {
    backdrop.classList.add('hidden');
  }

  function addReminder() {
    const text = textInput.value.trim();
    if (!text) {
      textInput.focus();
      return;
    }
    let hour = Number(hourInput && hourInput.value ? hourInput.value : 12);
    const minute = String(minuteInput && minuteInput.value ? minuteInput.value : '00').padStart(2, '0');
    const meridiem = meridiemInput && meridiemInput.value ? meridiemInput.value : 'AM';
    let hour24 = hour % 12;
    if (meridiem === 'PM') hour24 += 12;
    const time = `${String(hour24).padStart(2, '0')}:${minute}`;
    const reminders = getReminders();
    reminders.push({ id: Date.now(), text, time });
    saveReminders(reminders);
    renderReminders();
    textInput.value = '';
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    if (hourInput) hourInput.value = String(h);
    if (minuteInput) minuteInput.value = m;
    if (meridiemInput) meridiemInput.value = ampm;
    textInput.focus();
    speak(`Reminder set: ${text}`);
  }

  card.addEventListener('click', () => {
    unlockAlarmAudio();
    openModal();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  const testSoundBtn = document.getElementById('reminder-test-sound-btn');
  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      unlockAlarmAudio();
      playAlarmBeep();
    });
  }
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  if (addBtn) addBtn.addEventListener('click', addReminder);
  if (textInput) textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addReminder();
  });

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.reminder-delete-btn');
    if (!btn) return;
    const id = Number(btn.getAttribute('data-id'));
    const reminders = getReminders().filter(r => r.id !== id);
    saveReminders(reminders);
    renderReminders();
  });

  // Ask (once, quietly) for permission to show a system notification too,
  // in case the app is open in a background tab when a reminder fires.
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// 6e-2. Reminder Alarms — actually alert the person when a reminder's time arrives.
// Runs on every page (app.js is loaded everywhere) so an alarm fires no matter
// which screen the person is on. Checks every 15 seconds for a reminder whose
// time matches "now", and hasn't already fired today.
let alarmAudioCtx = null;
let alarmBeepIntervalId = null;
let reminderAudio = null;
let alarmAudioUnlocked = false;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str == null ? '' : str);
  return div.innerHTML;
}

function unlockAlarmAudio() {
  try {
    if (!alarmAudioCtx) {
      alarmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (alarmAudioCtx.state === 'suspended') alarmAudioCtx.resume();
    if (!reminderAudio) {
      reminderAudio = new Audio('assets/reminder-chime.wav');
      reminderAudio.preload = 'auto';
    }
    alarmAudioUnlocked = true;
  } catch (err) {
    console.error('Could not unlock alarm audio:', err);
  }
}

function playAlarmBeep() {
  try {
    unlockAlarmAudio();
    if (reminderAudio && alarmAudioUnlocked) {
      reminderAudio.currentTime = 0;
      const promise = reminderAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      return;
    }
    if (!alarmAudioCtx) return;
    const ctx = alarmAudioCtx;
    [0, 0.28].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.26);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch (err) {
    console.error('Error playing alarm sound:', err);
  }
}

function startAlarmSound() {
  playAlarmBeep();
  stopAlarmSound();
  alarmBeepIntervalId = setInterval(playAlarmBeep, 1800);
}

function stopAlarmSound() {
  if (alarmBeepIntervalId) {
    clearInterval(alarmBeepIntervalId);
    alarmBeepIntervalId = null;
  }
}

// Speaks the reminder regardless of the Voice Guidance setting, since this is
// an active alarm the person needs to hear, not passive UI narration.
function speakAlarm(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

function showReminderAlarmModal(reminder) {
  const existing = document.getElementById('reminder-alarm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'reminder-alarm-modal';
  modal.className = 'fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-[32px] max-w-md w-full p-8 sm:p-9 shadow-2xl text-center space-y-5 border-4 border-amber-400">
      <div class="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto animate-bounce">
        <i data-lucide="bell-ring" class="w-10 h-10"></i>
      </div>
      <div class="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Reminder</div>
      <div class="text-lg sm:text-xl font-bold text-slate-800 leading-snug">${escapeHtml(reminder.text)}</div>
      <div class="text-sm sm:text-base text-slate-400 font-medium">${escapeHtml(formatReminderTime(reminder.time))}</div>
      <button id="reminder-alarm-dismiss-btn" class="w-full bg-brand-navy hover:bg-brand-navyHover text-white py-4 rounded-2xl text-base sm:text-lg font-bold shadow-md transition-all active:scale-[0.99]">
        Got it, Dismiss
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  if (window.lucide) window.lucide.createIcons();

  const dismissBtn = document.getElementById('reminder-alarm-dismiss-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      stopAlarmSound();
      modal.remove();
    });
  }
}

function triggerReminderAlarm(reminder) {
  startAlarmSound();
  speakAlarm(`Reminder: ${reminder.text}`);
  showReminderAlarmModal(reminder);

  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    try {
      new Notification('Cognitive Care Reminder', { body: reminder.text });
    } catch (err) {
      console.error('Error showing notification:', err);
    }
  }
}

function checkReminderAlarms() {
  const now = new Date();
  const currentHM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const todayStr = now.toISOString().slice(0, 10);

  const reminders = getReminders();
  let changed = false;

  reminders.forEach((r) => {
    if (r.time && r.time === currentHM && r.lastFiredDate !== todayStr) {
      r.lastFiredDate = todayStr;
      changed = true;
      triggerReminderAlarm(r);
    }
  });

  if (changed) saveReminders(reminders);
}

function setupReminderAlarms() {
  checkReminderAlarms();
  setInterval(checkReminderAlarms, 15000);
}

// 6f. Memory Album (Home page) - upload & browse photos/videos of memories
const ALBUM_KEY = 'cognitive_care_album';
const ALBUM_MAX_FILE_BYTES = 8 * 1024 * 1024; // ~8MB raw file size guard

function getAlbumItems() {
  try {
    const saved = localStorage.getItem(ALBUM_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Error reading memory album:', err);
  }
  return [];
}

function saveAlbumItems(items) {
  try {
    localStorage.setItem(ALBUM_KEY, JSON.stringify(items));
    return true;
  } catch (err) {
    console.error('Error saving memory album (storage may be full):', err);
    return false;
  }
}

function renderMemoryAlbum() {
  const grid = document.getElementById('album-grid');
  const emptyState = document.getElementById('album-empty-state');
  if (!grid) return;

  const items = getAlbumItems();

  if (items.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = items.map(item => `
    <div class="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-xs">
      <button type="button" class="album-item-open w-full h-full block" data-id="${item.id}" title="${item.caption ? item.caption.replace(/"/g, '&quot;') : 'View memory'}">
        ${item.type === 'video'
          ? `<video src="${item.dataUrl}" class="w-full h-full object-cover" muted></video>
             <span class="absolute inset-0 flex items-center justify-center bg-slate-900/20">
               <span class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                 <i data-lucide="play" class="w-4 h-4 text-slate-800 fill-current"></i>
               </span>
             </span>`
          : `<img src="${item.dataUrl}" alt="${item.caption || 'Memory photo'}" class="w-full h-full object-cover">`
        }
      </button>
      ${item.caption ? `<div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/70 to-transparent text-white text-[10px] font-medium px-2 py-1.5 truncate pointer-events-none">${item.caption}</div>` : ''}
      <button type="button" class="album-item-delete absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" data-id="${item.id}" aria-label="Delete memory">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openAlbumViewer(item) {
  const backdrop = document.getElementById('album-viewer-backdrop');
  const content = document.getElementById('album-viewer-content');
  const captionEl = document.getElementById('album-viewer-caption');
  if (!backdrop || !content) return;

  content.innerHTML = item.type === 'video'
    ? `<video src="${item.dataUrl}" class="w-full max-h-[70vh] rounded-2xl bg-black" controls autoplay></video>`
    : `<img src="${item.dataUrl}" alt="${item.caption || 'Memory photo'}" class="w-full max-h-[70vh] object-contain rounded-2xl">`;

  if (captionEl) captionEl.textContent = item.caption || '';
  backdrop.classList.remove('hidden');
}

function closeAlbumViewer() {
  const backdrop = document.getElementById('album-viewer-backdrop');
  const content = document.getElementById('album-viewer-content');
  if (backdrop) backdrop.classList.add('hidden');
  if (content) content.innerHTML = ''; // stop any playing video
}

function setupMemoryAlbum() {
  const addBtn = document.getElementById('album-add-btn');
  const fileInput = document.getElementById('album-file-input');
  const grid = document.getElementById('album-grid');
  const viewerBackdrop = document.getElementById('album-viewer-backdrop');
  const viewerCloseBtn = document.getElementById('album-viewer-close-btn');
  const gameBtn = document.getElementById('album-game-btn');
  const gameBackdrop = document.getElementById('album-game-backdrop');
  const gameCloseBtn = document.getElementById('album-game-close-btn');

  if (!addBtn || !fileInput || !grid) return; // not the home page

  renderMemoryAlbum();

  addBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      alert('Please choose a photo or video file.');
      return;
    }
    if (file.size > ALBUM_MAX_FILE_BYTES) {
      alert('That file is a bit too large to save here. Please choose a photo or a short, smaller video clip.');
      return;
    }

    const caption = window.prompt('Add a short caption for this memory (optional):', '') || '';

    const reader = new FileReader();
    reader.onload = (e) => {
      const items = getAlbumItems();
      items.unshift({
        id: Date.now(),
        type: isVideo ? 'video' : 'image',
        dataUrl: e.target.result,
        caption: caption.trim(),
        date: new Date().toISOString()
      });

      const ok = saveAlbumItems(items);
      if (!ok) {
        alert('Sorry, there was not enough space to save this memory. Try removing an older item first, or choose a smaller file.');
        return;
      }
      renderMemoryAlbum();
      speak('Memory added to your album.');
    };
    reader.onerror = () => {
      console.error('Error reading album file');
      alert('Something went wrong reading that file. Please try again.');
    };
    reader.readAsDataURL(file);
  });

  grid.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.album-item-delete');
    if (deleteBtn) {
      const id = Number(deleteBtn.getAttribute('data-id'));
      const items = getAlbumItems().filter(i => i.id !== id);
      saveAlbumItems(items);
      renderMemoryAlbum();
      return;
    }
    const openBtn = e.target.closest('.album-item-open');
    if (openBtn) {
      const id = Number(openBtn.getAttribute('data-id'));
      const item = getAlbumItems().find(i => i.id === id);
      if (item) openAlbumViewer(item);
    }
  });

  if (viewerCloseBtn) viewerCloseBtn.addEventListener('click', closeAlbumViewer);
  if (gameBtn) gameBtn.addEventListener('click', openMemoryAlbumGame);
  if (gameCloseBtn) gameCloseBtn.addEventListener('click', closeMemoryAlbumGame);
  if (gameBackdrop) gameBackdrop.addEventListener('click', (e) => { if (e.target === gameBackdrop) closeMemoryAlbumGame(); });
  if (viewerBackdrop) {
    viewerBackdrop.addEventListener('click', (e) => {
      if (e.target === viewerBackdrop) closeAlbumViewer();
    });
  }
}


// 6g. Memory Album Game - photo matching using saved album memories
const ALBUM_GAME_DEMOS = [
  { name: 'Garden', url: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=85' },
  { name: 'Flower', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=85' },
  { name: 'Book', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=85' },
  { name: 'Coffee', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85' },
  { name: 'Apple', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=85' },
  { name: 'Plant', url: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=85' }
];
let albumGame = {
  cards: [], first: null, second: null, lock: true, matched: 0, attempts: 0,
  timer: null, round: 1, preview: true, started: false
};

function getGardenGrowthCount() {
  try { return Math.max(0, Number(localStorage.getItem('cognitiveCareGardenGrowth') || 0)); }
  catch (e) { return 0; }
}

function openMemoryAlbumGame() {
  const modal = document.getElementById('album-game-backdrop');
  if (!modal) return;
  modal.classList.remove('hidden');
  albumGame.round = 1;
  startMemoryAlbumGame(true);
  if (window.lucide) window.lucide.createIcons();
}

function closeMemoryAlbumGame() {
  const modal = document.getElementById('album-game-backdrop');
  if (albumGame.timer) clearTimeout(albumGame.timer);
  if (modal) modal.classList.add('hidden');
  albumGame.lock = true;
  albumGame.started = false;
}

function getAlbumGameSources() {
  const saved = getAlbumItems().filter(i => i.type === 'image' && i.dataUrl);
  const savedSources = saved.slice(0, 6).map((item, index) => ({
    id: `memory-${item.id}`,
    name: item.caption || `Memory ${index + 1}`,
    url: item.dataUrl
  }));
  const combined = [...savedSources];
  for (const demo of ALBUM_GAME_DEMOS) {
    if (combined.length >= 4) break;
    if (!combined.some(x => x.name === demo.name)) combined.push({ id: `demo-${demo.name}`, name: demo.name, url: demo.url });
  }
  return combined.slice(0, Math.max(4, Math.min(6, combined.length)));
}

function startMemoryAlbumGame(resetRound = false) {
  const board = document.getElementById('album-game-board');
  const status = document.getElementById('album-game-status');
  const score = document.getElementById('album-game-score');
  const actions = document.getElementById('album-game-actions');
  const roundEl = document.getElementById('album-game-round');
  const movesEl = document.getElementById('album-game-moves');
  const growthEl = document.getElementById('album-game-growth');
  if (!board || !status || !score || !actions) return;
  if (albumGame.timer) clearTimeout(albumGame.timer);

  if (resetRound) albumGame.round = 1;
  const sources = getAlbumGameSources().slice(0, albumGame.round >= 3 ? 6 : albumGame.round >= 2 ? 5 : 4);
  albumGame.cards = shuffleArray(sources.flatMap((source, pairIndex) => [
    { ...source, pairId: pairIndex, cardId: `${pairIndex}-a`, flipped: true, matched: false },
    { ...source, pairId: pairIndex, cardId: `${pairIndex}-b`, flipped: true, matched: false }
  ]));
  albumGame.first = null; albumGame.second = null; albumGame.lock = true; albumGame.matched = 0; albumGame.attempts = 0;
  albumGame.preview = true; albumGame.started = false;

  if (roundEl) roundEl.textContent = String(albumGame.round);
  score.textContent = `0/${sources.length}`;
  if (movesEl) movesEl.textContent = '0';
  if (growthEl) growthEl.textContent = `${getGardenGrowthCount()} growths`;
  status.textContent = '👀 Remember where you see each memory…';
  actions.innerHTML = `<button type="button" class="bg-violet-700 hover:bg-violet-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm" onclick="beginMemoryRound()">Start Round</button>`;

  board.innerHTML = albumGame.cards.map((card, index) => `
    <button type="button" class="album-memory-card relative rounded-2xl overflow-hidden shadow-sm transition-all duration-200" data-index="${index}" aria-label="Memory card ${index + 1}">
      <div class="album-memory-card-back absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-100 via-white to-emerald-100 transition-opacity duration-200">
        <div class="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-violet-700 text-2xl">🧠</div>
        <span class="mt-2 text-[10px] font-extrabold uppercase tracking-wider text-violet-500">Memory</span>
      </div>
      <div class="album-memory-card-front-wrap">
        <div class="album-card-image"><img src="${card.url}" alt="${escapeHtml(card.name)}"></div>
        <div class="album-card-label">${escapeHtml(card.name)}</div>
      </div>
    </button>
  `).join('');

  // Preview: show every photo first so the task is truly about remembering locations.
  setTimeout(() => beginMemoryRound(), 2800);
}

function revealAlbumCard(btn, visible) {
  if (!btn) return;
  const front = btn.querySelector('.album-memory-card-front-wrap');
  const back = btn.querySelector('.album-memory-card-back');
  if (visible) {
    front?.classList.remove('is-hidden');
    back?.classList.add('is-hidden');
  } else {
    front?.classList.add('is-hidden');
    back?.classList.remove('is-hidden');
  }
}

function beginMemoryRound() {
  if (!albumGame.preview || albumGame.started) return;
  albumGame.preview = false;
  albumGame.started = true;
  albumGame.lock = false;
  document.querySelectorAll('.album-memory-card').forEach(btn => {
    btn.classList.remove('is-preview');
    revealAlbumCard(btn, false);
    if (!btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => flipAlbumMemoryCard(Number(btn.dataset.index), btn));
    }
  });
  const status = document.getElementById('album-game-status');
  const actions = document.getElementById('album-game-actions');
  if (status) status.textContent = 'Find two matching memories. Take your time.';
  if (actions) actions.innerHTML = `<button type="button" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50" onclick="startMemoryAlbumGame(false)">Restart</button>`;
}

function flipAlbumMemoryCard(index, btn) {
  if (albumGame.lock || albumGame.preview || !albumGame.started) return;
  const card = albumGame.cards[index];
  if (!card || card.flipped || card.matched) return;

  card.flipped = true;
  revealAlbumCard(btn, true);
  btn.classList.add('ring-4','ring-violet-200');

  if (albumGame.first === null) {
    albumGame.first = index;
    const status = document.getElementById('album-game-status');
    if (status) status.textContent = 'Good — now find the same memory.';
    return;
  }

  albumGame.second = index;
  albumGame.attempts += 1;
  albumGame.lock = true;
  const movesEl = document.getElementById('album-game-moves');
  if (movesEl) movesEl.textContent = String(albumGame.attempts);

  const firstCard = albumGame.cards[albumGame.first];
  const secondCard = albumGame.cards[albumGame.second];
  const firstBtn = document.querySelector(`.album-memory-card[data-index="${albumGame.first}"]`);

  if (firstCard.pairId === secondCard.pairId) {
    firstCard.matched = secondCard.matched = true;
    albumGame.matched += 1;
    firstBtn?.classList.add('is-matched');
    btn.classList.add('is-matched');
    firstBtn?.classList.remove('ring-4','ring-violet-200');
    btn.classList.remove('ring-4','ring-violet-200');
    document.getElementById('album-game-score').textContent = `${albumGame.matched}/${new Set(albumGame.cards.map(c => c.pairId)).size}`;
    const status = document.getElementById('album-game-status');
    if (status) status.textContent = '✨ Beautiful — you remembered it!';
    albumGame.first = null; albumGame.second = null; albumGame.lock = false;
    const totalPairs = new Set(albumGame.cards.map(c => c.pairId)).size;
    if (albumGame.matched === totalPairs) finishMemoryAlbumGame();
  } else {
    firstBtn?.classList.add('is-wrong');
    btn.classList.add('is-wrong');
    const status = document.getElementById('album-game-status');
    if (status) status.textContent = 'Almost — watch the locations and try again.';
    albumGame.timer = setTimeout(() => {
      [albumGame.first, albumGame.second].forEach(i => {
        const c = albumGame.cards[i];
        if (c) c.flipped = false;
        const cardBtn = document.querySelector(`.album-memory-card[data-index="${i}"]`);
        revealAlbumCard(cardBtn, false);
        cardBtn?.classList.remove('ring-4','ring-violet-200','is-wrong');
      });
      albumGame.first = null; albumGame.second = null; albumGame.lock = false;
      if (status) status.textContent = 'Choose two cards';
    }, 850);
  }
}

function finishMemoryAlbumGame() {
  albumGame.lock = true;
  const scoreValue = Math.max(70, 100 - Math.max(0, albumGame.attempts - albumGame.matched) * 5);
  let growth = getGardenGrowthCount() + 1;
  try { localStorage.setItem('cognitiveCareGardenGrowth', String(growth)); } catch (e) {}
  if (typeof recordCompletedActivity === 'function') recordCompletedActivity('Memory Match Journey', 'memory', scoreValue);

  const status = document.getElementById('album-game-status');
  const actions = document.getElementById('album-game-actions');
  const growthEl = document.getElementById('album-game-growth');
  if (growthEl) growthEl.textContent = `${growth} growth${growth === 1 ? '' : 's'}`;
  if (status) status.textContent = `🌸 Wonderful! You found every pair in ${albumGame.attempts} moves.`;
  if (actions) actions.innerHTML = `
    <div class="w-full max-w-2xl rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-5 sm:p-6 text-center shadow-sm">
      <div class="text-4xl mb-2">🌱 → 🌿 → 🌸</div>
      <div class="font-serif text-2xl font-bold text-slate-900">Your garden grew!</div>
      <p class="text-sm text-slate-600 mt-2 leading-relaxed">You earned <strong>${scoreValue} memory points</strong>. Your Cognitive Care garden now has <strong>${growth} growth${growth === 1 ? '' : 's'}</strong>.</p>
      <div class="mt-5 flex flex-wrap justify-center gap-2.5">
        <button type="button" onclick="nextMemoryAlbumRound()" class="bg-violet-700 hover:bg-violet-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Grow again</button>
        <button type="button" onclick="closeMemoryAlbumGame()" class="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm">Done</button>
      </div>
    </div>`;
  if (typeof updateCognitiveWorld === 'function') updateCognitiveWorld();
  if (typeof renderGardenGrowth === 'function') renderGardenGrowth();
}

function nextMemoryAlbumRound() {
  albumGame.round = Math.min(3, albumGame.round + 1);
  startMemoryAlbumGame(false);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
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


// 9. Game Difficulty Levels (persisted, gently increasing per game)
const GAME_LEVELS_KEY = 'cognitive_care_game_levels';
const GAME_MAX_LEVEL = 5; // five gentle stages with varied content

const DEFAULT_GAME_LEVELS = {
  cardMatching: 1,
  rememberObjects: 1,
  sequence: 1,
  story: 1,
  garden: 1
};

function getGameLevels() {
  try {
    const saved = localStorage.getItem(GAME_LEVELS_KEY);
    if (saved) return Object.assign({}, DEFAULT_GAME_LEVELS, JSON.parse(saved));
  } catch (err) {
    console.error('Error reading game levels:', err);
  }
  return Object.assign({}, DEFAULT_GAME_LEVELS);
}

function saveGameLevels(levels) {
  try {
    localStorage.setItem(GAME_LEVELS_KEY, JSON.stringify(levels));
  } catch (err) {
    console.error('Error saving game levels:', err);
  }
}

// Call after a successful round to gently step up difficulty (capped).
function advanceGameLevel(gameKey) {
  const levels = getGameLevels();
  const current = levels[gameKey] || 1;
  levels[gameKey] = Math.min(GAME_MAX_LEVEL, current + 1);
  saveGameLevels(levels);
  return levels[gameKey];
}

function getGameLevel(gameKey) {
  return getGameLevels()[gameKey] || 1;
}

function gameLevelLabel(level) {
  if (level <= 1) return 'Gentle';
  if (level === 2) return 'Moderate';
  if (level === 3) return 'Steady';
  if (level === 4) return 'Challenging';
  return 'Advanced';
}
