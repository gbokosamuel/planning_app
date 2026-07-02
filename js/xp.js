/* ═══════════════════════════════════════════════════
   XP — Experience Points + Animations
   ═══════════════════════════════════════════════════ */

const XP = {
  BASE_POINTS: 100,
  STREAK_BONUS: 50,
  STREAK_THRESHOLD: 3,
  MAX_LEVEL_XP: 1000, // XP per level for the bar

  /**
   * Calculate XP reward for completing a day
   */
  calculateReward(track) {
    const streak = State.getStreak();
    let reward = this.BASE_POINTS;
    if (streak.current >= this.STREAK_THRESHOLD) {
      reward += this.STREAK_BONUS;
    }
    return reward;
  },

  /**
   * Award XP for a completed day
   */
  award(track) {
    const reward = this.calculateReward(track);
    const xp = State.addXP(track, reward);
    return { reward, total: xp };
  },

  /**
   * Render an XP bar component
   */
  renderBar(containerId, track, label) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const xp = State.getXP();
    const currentXP = xp[track] || 0;
    const level = Math.floor(currentXP / this.MAX_LEVEL_XP) + 1;
    const xpInLevel = currentXP % this.MAX_LEVEL_XP;
    const pct = Math.min((xpInLevel / this.MAX_LEVEL_XP) * 100, 100);

    container.innerHTML = `
      <div class="xp-bar-container">
        <div class="xp-bar__header">
          <span class="xp-bar__label" style="color: var(--accent-${track})">${label}</span>
          <span class="xp-bar__value" style="color: var(--accent-${track})">${currentXP} XP · Niv. ${level}</span>
        </div>
        <div class="xp-bar__track">
          <div class="xp-bar__fill xp-bar__fill--${track}" style="width: ${pct}%" id="xp-fill-${track}"></div>
        </div>
      </div>
    `;
  },

  /**
   * Animate the XP bar glow effect
   */
  animateGlow(track) {
    const fill = document.getElementById(`xp-fill-${track}`);
    if (!fill) return;
    fill.classList.add('glowing');
    setTimeout(() => fill.classList.remove('glowing'), 800);
  },

  /**
   * Render all 3 XP bars
   */
  renderAllBars(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div id="xp-bar-data"></div>
      <div id="xp-bar-creative"></div>
      <div id="xp-bar-langue"></div>
    `;

    this.renderBar('xp-bar-data', 'data', 'TRACK DATA');
    this.renderBar('xp-bar-creative', 'creative', 'TRACK CRÉATIF');
    this.renderBar('xp-bar-langue', 'langue', 'LANGUES');
  },

  /**
   * Show sprint completion celebration
   */
  showCelebration(sprintTitle, deliverable) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'celebration';
    overlay.id = 'celebration-overlay';
    overlay.innerHTML = `
      <div class="celebration__title">SPRINT TERMINÉ</div>
      <div class="celebration__subtitle">${Utils.escapeHtml(sprintTitle)}</div>
      <p style="color: var(--text-secondary); margin-top: var(--space-16); font-size: var(--fs-small);">
        Livrable : ${Utils.escapeHtml(deliverable)}
      </p>
    `;

    document.body.appendChild(overlay);

    // Add confetti
    this._spawnConfetti(overlay);

    // Show
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });

    // Dismiss after 4 seconds or on click
    const dismiss = () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    };

    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  },

  /**
   * Spawn CSS confetti particles
   */
  _spawnConfetti(container) {
    const colors = ['#6366F1', '#F59E0B', '#10B981', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899'];
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      particle.style.animationDelay = `${Math.random() * 0.5}s`;
      particle.style.width = `${6 + Math.random() * 6}px`;
      particle.style.height = `${6 + Math.random() * 6}px`;
      container.appendChild(particle);
    }
  },

  /**
   * Show a toast notification
   */
  showToast(message, type = '') {
    // Remove existing toast
    document.querySelector('.toast')?.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type ? 'toast--' + type : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};
