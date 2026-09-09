(function () {
  'use strict';

  function byAll(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function readAccount() {
    try { return JSON.parse(localStorage.getItem('cognitive_care_caregiver_account') || 'null'); }
    catch (_) { return null; }
  }

  function isLoggedIn() { return sessionStorage.getItem('cognitive_care_logged_in') === 'true'; }

  function setupProfileMenus() {
    byAll('[data-profile-menu]').forEach(function (root) {
      var btn = root.querySelector('.profile-menu-btn');
      var menu = root.querySelector('.profile-menu');
      if (!btn || !menu || btn.dataset.deployBound === '1') return;
      btn.dataset.deployBound = '1';
      var login = root.querySelector('.profile-login');
      var logout = root.querySelector('.profile-logout');
      var email = root.querySelector('.profile-menu-email');

      function sync() {
        var logged = isLoggedIn(), acc = readAccount();
        if (email) email.textContent = logged && acc && acc.email ? acc.email : 'Not signed in';
        if (login) login.classList.toggle('hidden', logged);
        if (logout) logout.classList.toggle('hidden', !logged);
      }

      btn.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        var opening = menu.classList.contains('hidden');
        byAll('.profile-menu').forEach(function (m) { m.classList.add('hidden'); });
        byAll('.profile-menu-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
        if (opening) {
          menu.classList.remove('hidden');
          btn.setAttribute('aria-expanded', 'true');
          sync();
        }
      });

      if (login) login.addEventListener('click', function () { window.location.href = 'login.html'; });
      if (logout) logout.addEventListener('click', function () {
        sessionStorage.removeItem('cognitive_care_logged_in');
        localStorage.removeItem('cognitive_care_remembered_login');
        window.location.href = 'login.html';
      });
      sync();
    });

    if (!window.__deployProfileDocBound) {
      window.__deployProfileDocBound = true;
      document.addEventListener('click', function (ev) {
        byAll('[data-profile-menu]').forEach(function (root) {
          if (!root.contains(ev.target)) {
            var menu = root.querySelector('.profile-menu'), btn = root.querySelector('.profile-menu-btn');
            if (menu) menu.classList.add('hidden');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  }

  function getState() {
    try {
      var raw = localStorage.getItem('cognitive_care_state');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { recentGames: [] };
  }

  function setupProgress() {
    var buttons = byAll('[data-progress-period]');
    if (!buttons.length) return;
    if (window.__deployProgressBound) return;
    window.__deployProgressBound = true;
    var active = 'week';

    function gamesFor(period) {
      var list = Array.isArray(getState().recentGames) ? getState().recentGames : [];
      if (period === 'all') return list;
      var now = new Date();
      var start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (period === 'week' ? 6 : 29));
      return list.filter(function (g) {
        var d = g && g.timestamp ? new Date(g.timestamp) : null;
        return d && !isNaN(d.getTime()) && d >= start;
      });
    }

    function paint() {
      var list = gamesFor(active), count = list.length;
      var total = list.reduce(function (s, g) { return s + Number(g.score || 0); }, 0);
      var acc = count ? Math.round(total / count) : 0;
      var a = document.getElementById('stat-activities');
      var b = document.getElementById('stat-accuracy');
      if (a) a.textContent = count;
      if (b) b.textContent = acc + '%';
      buttons.forEach(function (button) {
        var on = button.getAttribute('data-progress-period') === active;
        button.className = on
          ? 'bg-brand-navy text-white px-3.5 py-1.5 rounded-xl shadow-xs'
          : 'text-slate-600 hover:text-slate-900 px-3.5 py-1.5 transition-colors';
      });
      var target = document.getElementById('recent-games-list');
      if (!target) return;
      if (!count) {
        target.innerHTML = '<div class="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">No games in this period yet.</div>';
        return;
      }
      target.innerHTML = list.map(function (g) {
        var date = g.timestamp ? new Date(g.timestamp) : null;
        var shown = date && !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', {month:'short', day:'numeric'}) : '';
        return '<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">🎮</div><div><div class="font-bold text-slate-900 text-xs">' + String(g.name || 'Game').replace(/[&<>"']/g, '') + '</div><div class="text-[11px] text-slate-400">' + shown + '</div></div></div><div class="text-xs font-bold text-slate-900">' + Number(g.score || 0) + '% <span class="text-[10px] font-normal text-slate-400">Score</span></div></div>';
      }).join('');
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function (ev) {
        ev.preventDefault();
        active = button.getAttribute('data-progress-period') || 'week';
        paint();
      });
    });
    paint();
  }

  function wait() {
    setupProfileMenus();
    setupProgress();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait);
  else wait();
  window.addEventListener('pageshow', wait);
})();
