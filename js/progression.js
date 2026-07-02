/* ═══════════════════════════════════════════════════
   PROGRESSION — Mur de trophées
   ═══════════════════════════════════════════════════ */

const Progression = {
  async render(container) {
    const startDate = State.getStartDate();
    const streak = State.getStreak();
    const xp = State.getXP();
    const outputs = State.getOutputs();
    const badges = Data.getBadges();

    // GitHub-style grid
    const dayStatuses = startDate ? State.getDayStatuses(startDate) : [];
    const gridCells = dayStatuses.map(ds => {
      const isToday = ds.status === 'today';
      const dateStr = Utils.formatDate(ds.date);
      return `<div class="progression__grid-cell ${ds.status} ${isToday ? 'today' : ''}" 
                   title="${dateStr} — Sprint ${ds.sprintId}"></div>`;
    }).join('');

    // Completed sprints
    const sprints = Data.getSprints();
    const completedSprintsHtml = sprints.map(s => {
      const isDone = State.isSprintCompleted(s.id);
      return `
        <div class="progression__sprint-item">
          <div class="progression__sprint-icon ${isDone ? 'progression__sprint-icon--completed' : 'progression__sprint-icon--locked'}">
            ${isDone ? '✓' : '🔒'}
          </div>
          <div>
            <div class="progression__sprint-name">Sprint ${s.id} — ${Utils.escapeHtml(s.title)}</div>
            ${isDone 
              ? `<div class="progression__sprint-date">Complété</div>`
              : `<div class="progression__sprint-date" style="color: var(--text-muted);">En cours / À venir</div>`
            }
          </div>
        </div>
      `;
    }).join('');

    // Badges
    const badgesHtml = badges.map(b => {
      let unlocked = false;
      if (b.sprint) {
        unlocked = State.isSprintCompleted(b.sprint);
      } else if (b.track === 'streak') {
        if (b.id === 'streak_7') unlocked = streak.best >= 7;
        if (b.id === 'streak_30') unlocked = streak.best >= 30;
      }
      return `
        <div class="progression__badge ${unlocked ? 'unlocked' : 'locked'}">
          <div class="progression__badge-icon">${b.icon}</div>
          <div class="progression__badge-name">${Utils.escapeHtml(b.name)}</div>
        </div>
      `;
    }).join('');

    // Outputs list
    const outputsHtml = outputs.length > 0
      ? outputs.slice().reverse().slice(0, 20).map(o => `
          <div class="progression__output-item">
            <div class="progression__output-text">${Utils.escapeHtml(o.text)}</div>
            <div class="progression__output-date">Sprint ${o.sprintId} · ${Utils.formatDate(o.date)}</div>
          </div>
        `).join('')
      : '<div class="empty-state"><div class="empty-state__text">Pas encore d\'outputs. Complète ton premier défi !</div></div>';

    container.innerHTML = `
      <!-- Header -->
      <div class="progression__header">
        <div class="progression__title">Progression</div>
      </div>

      <!-- Streak -->
      <div class="progression__streak">
        <div class="progression__streak-number">${streak.current}</div>
        <div class="progression__streak-info">
          <div class="progression__streak-label">jours consécutifs</div>
          <div class="progression__streak-best">Record : ${streak.best} 🔥</div>
        </div>
      </div>

      <!-- GitHub Grid -->
      <div class="progression__grid-section">
        <div class="progression__grid-title">Activité</div>
        <div class="progression__grid">${gridCells}</div>
        <div class="progression__grid-legend">
          <div class="progression__grid-legend-swatch" style="background: var(--color-missed);"></div> Manqué
          <div class="progression__grid-legend-swatch" style="background: var(--color-partial);"></div> Partiel
          <div class="progression__grid-legend-swatch" style="background: var(--color-success);"></div> Complété
        </div>
      </div>

      <!-- XP Bars -->
      <div class="progression__xp-section">
        <div class="progression__grid-title">Expérience</div>
        <div class="progression__xp-bars" id="progression-xp-bars"></div>
      </div>

      <!-- Sprints -->
      <div class="progression__sprints-section">
        <div class="progression__grid-title">Sprints</div>
        ${completedSprintsHtml}
      </div>

      <!-- Badges -->
      <div class="progression__badges-section">
        <div class="progression__grid-title">Badges</div>
        <div class="progression__badges-grid">${badgesHtml}</div>
      </div>

      <!-- Outputs -->
      <div class="progression__outputs-section">
        <div class="progression__grid-title">Outputs produits</div>
        ${outputsHtml}
      </div>

      <!-- Export -->
      <button class="btn btn--ghost btn--full mt-16" onclick="window.print()">
        🖨️ Exporter en PDF
      </button>
    `;

    // Render XP bars
    XP.renderAllBars('progression-xp-bars');
  },

  destroy() {
    // Nothing to clean up
  }
};
