/* ═══════════════════════════════════════════════════
   TIMER — 90min SVG circle + Inactivity Detection
   ═══════════════════════════════════════════════════ */

const Timer = {
  _interval: null,
  _remaining: 0,      // seconds
  _total: 0,          // seconds
  _running: false,
  _onTick: null,
  _onComplete: null,
  _track: 'data',     // 'data' or 'creative'

  // Inactivity
  _inactivityTimer: null,
  _inactivityLimit: 20 * 60 * 1000, // 20 minutes in ms
  _onInactive: null,
  _events: ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'],

  /* ── Timer ── */

  init(minutes, track, onTick, onComplete) {
    this._total = minutes * 60;
    this._remaining = this._total;
    this._track = track;
    this._onTick = onTick;
    this._onComplete = onComplete;
    this._running = false;

    // Restore from state if exists
    const saved = State.getTimerState();
    if (saved && saved.track === track) {
      this._remaining = saved.remaining;
      this._total = saved.total;
    }

    if (this._onTick) this._onTick(this._remaining, this._total, this._running);
  },

  start() {
    if (this._running) return;
    this._running = true;
    this._interval = setInterval(() => {
      this._remaining--;
      if (this._remaining <= 0) {
        this._remaining = 0;
        this.stop();
        this._playSound();
        if (this._onComplete) this._onComplete();
      }
      if (this._onTick) this._onTick(this._remaining, this._total, this._running);
      // Save state every 30 seconds
      if (this._remaining % 30 === 0) {
        State.setTimerState({
          remaining: this._remaining,
          total: this._total,
          track: this._track
        });
      }
    }, 1000);
  },

  pause() {
    this._running = false;
    clearInterval(this._interval);
    State.setTimerState({
      remaining: this._remaining,
      total: this._total,
      track: this._track
    });
    if (this._onTick) this._onTick(this._remaining, this._total, this._running);
  },

  stop() {
    this._running = false;
    clearInterval(this._interval);
    State.clearTimerState();
  },

  reset(minutes) {
    this.stop();
    this._total = (minutes || 90) * 60;
    this._remaining = this._total;
    if (this._onTick) this._onTick(this._remaining, this._total, this._running);
  },

  toggle() {
    if (this._running) {
      this.pause();
    } else {
      this.start();
    }
  },

  isRunning() {
    return this._running;
  },

  getProgress() {
    if (this._total === 0) return 0;
    return 1 - (this._remaining / this._total);
  },

  /**
   * Render the SVG timer circle
   */
  renderCircle(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const trackClass = this._track === 'creative' ? 'timer-circle__progress--creative' : '';

    container.innerHTML = `
      <div class="timer-circle">
        <svg viewBox="0 0 120 120">
          <circle class="timer-circle__bg" cx="60" cy="60" r="${radius}" />
          <circle class="timer-circle__progress ${trackClass}" cx="60" cy="60" r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="0"
            id="timer-progress-ring" />
        </svg>
        <div class="timer-circle__time">
          <span id="timer-display">${Utils.formatTime(this._remaining)}</span>
          <span class="timer-circle__label" id="timer-label">${this._running ? 'EN COURS' : 'PRÊT'}</span>
        </div>
      </div>
      <div class="timer-controls">
        <button class="btn btn--primary btn--small" id="timer-toggle-btn">
          ${this._running ? '⏸ Pause' : '▶ Démarrer'}
        </button>
        <button class="btn btn--ghost btn--small" id="timer-reset-btn">↺ Reset</button>
      </div>
    `;

    // Set initial progress
    this._updateRing();

    // Bind events
    document.getElementById('timer-toggle-btn')?.addEventListener('click', () => this.toggle());
    document.getElementById('timer-reset-btn')?.addEventListener('click', () => this.reset());

    // Set up tick callback to update display
    this._onTick = (remaining, total, running) => {
      const display = document.getElementById('timer-display');
      const label = document.getElementById('timer-label');
      const btn = document.getElementById('timer-toggle-btn');
      if (display) display.textContent = Utils.formatTime(remaining);
      if (label) label.textContent = running ? 'EN COURS' : (remaining === 0 ? 'TERMINÉ' : 'PAUSE');
      if (btn) btn.innerHTML = running ? '⏸ Pause' : '▶ Démarrer';
      this._updateRing();
    };
  },

  _updateRing() {
    const ring = document.getElementById('timer-progress-ring');
    if (!ring) return;
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * this.getProgress();
    ring.style.strokeDashoffset = offset;
  },

  /**
   * Play a short beep using Web Audio API
   */
  _playSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not available, skip
    }
  },

  /* ── Inactivity Detection ── */

  startInactivityWatch(onInactive) {
    this._onInactive = onInactive;
    this._resetInactivity();
    this._events.forEach(evt => {
      document.addEventListener(evt, this._handleActivity, { passive: true });
    });
  },

  stopInactivityWatch() {
    clearTimeout(this._inactivityTimer);
    this._events.forEach(evt => {
      document.removeEventListener(evt, this._handleActivity);
    });
  },

  _handleActivity: (() => {
    // Use a closure so `this` binds correctly
    let self;
    const handler = () => {
      if (self) self._resetInactivity();
    };
    handler._setSelf = (s) => { self = s; };
    return handler;
  })(),

  _resetInactivity() {
    // Ensure handler has reference to Timer
    this._handleActivity._setSelf(this);
    clearTimeout(this._inactivityTimer);
    this._inactivityTimer = setTimeout(() => {
      if (this._onInactive) this._onInactive();
    }, this._inactivityLimit);
  }
};
