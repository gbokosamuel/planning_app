/* ═══════════════════════════════════════════════════
   APP — Router, Navigation, Initialization
   ═══════════════════════════════════════════════════ */

const App = {
  _currentView: null,
  _views: {
    cockpit: Cockpit,
    sprint: Sprint,
    progression: Progression,
    onboarding: Onboarding
  },

  async init() {
    // Load data
    await Data.load();

    // Build navigation
    this._renderNav();

    // Determine initial view
    if (!State.isOnboardingDone()) {
      this.navigate('onboarding');
    } else {
      // Check hash
      const hash = window.location.hash.replace('#', '') || 'cockpit';
      this.navigate(hash);
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'cockpit';
      this.navigate(hash);
    });
  },

  navigate(viewName) {
    if (!this._views[viewName]) viewName = 'cockpit';

    // Destroy previous view
    if (this._currentView && this._views[this._currentView]?.destroy) {
      this._views[this._currentView].destroy();
    }

    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Show target view
    const viewEl = document.getElementById(`view-${viewName}`);
    if (viewEl) {
      viewEl.classList.add('active');
      // Re-trigger fade animation
      viewEl.style.animation = 'none';
      viewEl.offsetHeight; // trigger reflow
      viewEl.style.animation = '';
    }

    // Render view
    this._currentView = viewName;
    const container = document.getElementById(`view-${viewName}`);
    if (container && this._views[viewName]) {
      this._views[viewName].render(container);
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update hash without triggering hashchange
    if (window.location.hash !== `#${viewName}`) {
      history.replaceState(null, '', `#${viewName}`);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  },

  _renderNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    nav.innerHTML = `
      <button class="nav-item" data-view="cockpit">
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="nav-item__label">Cockpit</span>
      </button>
      <button class="nav-item" data-view="sprint">
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span class="nav-item__label">Sprint</span>
      </button>
      <button class="nav-item" data-view="progression">
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span class="nav-item__label">Progression</span>
      </button>
      <button class="nav-item" data-view="onboarding">
        <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span class="nav-item__label">Setup</span>
      </button>
    `;

    // Bind nav clicks
    nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.navigate(item.dataset.view);
      });
    });
  }
};

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
