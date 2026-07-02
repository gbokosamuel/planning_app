/* ═══════════════════════════════════════════════════
   COCKPIT — Vue principale (jour en cours)
   ═══════════════════════════════════════════════════ */

const Cockpit = {
  _position: null,

  async render(container) {
    const startDate = State.getStartDate();
    if (!startDate) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🧭</div><div class="empty-state__text">Configure ta date de démarrage dans l\'onboarding.</div></div>';
      return;
    }

    this._position = Data.getCurrentPosition(startDate);
    const { sprintId, dayIndex, isOffDay, notStarted, completed } = this._position;
    const sprint = Data.getSprint(sprintId);
    const day = Data.getDay(sprintId, dayIndex);
    const creativeProjects = Data.getCreativeProjects();

    if (!sprint || !day) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🎉</div><div class="empty-state__text">Programme terminé ! Bravo Samuel !</div></div>';
      return;
    }

    const isDone = State.isDayCompleted(sprintId, dayIndex);
    const streak = State.getStreak();
    const daysSinceLastAction = streak.lastDate ? Utils.daysBetween(streak.lastDate, Utils.todayStr()) : -1;
    const showWelcomeBack = daysSinceLastAction > 2;

    // Build day dots for the sprint
    const totalDays = Data.getSprintDayCount(sprintId);
    let dayDots = '';
    for (let i = 0; i < totalDays; i++) {
      const isCompleted = State.isDayCompleted(sprintId, i);
      const isCurrent = i === dayIndex;
      dayDots += `<div class="cockpit__day-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}"></div>`;
    }

    container.innerHTML = `
      ${showWelcomeBack ? `
        <div class="cockpit__welcome-back">
          <div class="cockpit__welcome-back__text">
            Voilà où tu en es. Voilà le prochain défi. 🧭
          </div>
        </div>
      ` : ''}

      ${isOffDay ? `
        <div class="card" style="text-align: center; margin-bottom: var(--space-24);">
          <div style="font-size: 2rem; margin-bottom: var(--space-8);">😴</div>
          <div class="card__title">Lundi — Jour de récupération</div>
          <div class="card__description">Repos cérébral. Pas de travail. Reviens demain reposé et prêt.</div>
        </div>
      ` : ''}

      ${notStarted ? `
        <div class="card" style="text-align: center; margin-bottom: var(--space-24);">
          <div style="font-size: 2rem; margin-bottom: var(--space-8);">⏳</div>
          <div class="card__title">Le programme commence le ${Utils.formatDateLong(startDate)}</div>
          <div class="card__description">Prépare-toi. Vérifie que tout est installé.</div>
        </div>
      ` : ''}

      <div class="cockpit__header">
        <div class="cockpit__greeting">${Utils.capitalize(Utils.getDayName(new Date()))} · Sprint ${sprintId}</div>
        <div class="cockpit__sprint-title">${Utils.escapeHtml(sprint.title)}</div>
        <div class="cockpit__sprint-subtitle">${Utils.escapeHtml(sprint.challenge)}</div>
        <div class="cockpit__day-indicator">${dayDots}</div>
      </div>

      ${isDone ? `
        <div class="cockpit__completed-banner">
          <div class="cockpit__completed-emoji">✅</div>
          <div class="cockpit__completed-text">Jour complété !</div>
          <p class="mt-16 text-muted" style="font-size: var(--fs-small);">Reviens demain pour le prochain défi.</p>
        </div>
      ` : `
        <div class="cockpit__tasks">
          <!-- DATA TASK -->
          <div class="cockpit__task-card">
            <div class="section-label section-label--data">TRACK DATA · 90 min</div>
            <div class="card card--data">
              <div class="card__title">
                <span class="badge badge--data">DATA</span>
                ${Utils.escapeHtml(day.day_name)} S${day.week}
              </div>
              <div class="card__description">${Utils.escapeHtml(day.task)}</div>
              <div class="card__output card__output--data">${Utils.escapeHtml(day.output)}</div>
            </div>
          </div>

          <!-- CREATIVE TASK -->
          <div class="cockpit__task-card">
            <div class="section-label section-label--creative">TRACK CRÉATIF · 90 min</div>
            <div class="card card--creative" style="border-left-color: ${creativeProjects[day.creative_project]?.color || 'var(--accent-creative)'};">
              <div class="card__title">
                <span class="badge badge--creative" style="background-color: ${creativeProjects[day.creative_project]?.color}20; color: ${creativeProjects[day.creative_project]?.color}; border: 1px solid ${creativeProjects[day.creative_project]?.color}40;">
                  ${creativeProjects[day.creative_project]?.icon || '🎨'} ${Utils.escapeHtml(creativeProjects[day.creative_project]?.name || 'CRÉATIF').toUpperCase()}
                </span>
              </div>
              <div class="card__description" style="margin-top: 8px;">${Utils.escapeHtml(day.creative_task)}</div>
              <div class="card__output card__output--creative" style="background: ${creativeProjects[day.creative_project]?.color}10; color: ${creativeProjects[day.creative_project]?.color}; border-left-color: ${creativeProjects[day.creative_project]?.color};">
                ${Utils.escapeHtml(day.creative_output)}
              </div>
            </div>
          </div>
        </div>

        <!-- TIMER -->
        <div class="cockpit__timer-section">
          <div class="timer-container" id="cockpit-timer"></div>
        </div>

        <!-- COMPLETE BUTTON -->
        <div class="cockpit__actions">
          <button class="btn btn--complete" id="cockpit-complete-btn">
            ✓ TERMINÉ — J'ai produit quelque chose
          </button>
        </div>
      `}

      <!-- RESOURCES -->
      <button class="cockpit__resources-btn mt-16" id="cockpit-resources-btn">
        📚 Où travailler ? — Ressources Sprint ${sprintId}
      </button>

      <!-- MINI SECTIONS: Langue + Cog -->
      <div class="cockpit__mini-sections">
        <div class="card card--langue cockpit__mini-card">
          <span class="badge badge--langue">15 min</span>
          <div class="cockpit__mini-card__info">
            <div class="cockpit__mini-card__title">Langue du jour</div>
            <div class="cockpit__mini-card__desc">Coréen : Anki flashcards + Anglais technique : 15 termes data</div>
          </div>
        </div>
        <div class="card card--cog cockpit__mini-card" id="cockpit-cog-soir">
          <span class="badge" style="background: rgba(139,148,158,0.12); color: var(--text-muted);">18h</span>
          <div class="cockpit__mini-card__info">
            <div class="cockpit__mini-card__title">COG SOIR</div>
            <div class="cockpit__mini-card__desc">Restitution de mémoire + 3 flashcards Anki</div>
          </div>
        </div>
      </div>

      <!-- CREATIVE PROJECTS PROGRESS -->
      <div class="cockpit__creative-progress mt-24">
        <div class="section-label">PROGRESSION DES PROJETS CRÉATIFS</div>
        <div style="display: flex; flex-direction: column; gap: var(--space-12); margin-top: var(--space-8); background: var(--bg-secondary); padding: var(--space-16); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          ${Object.entries(creativeProjects).map(([key, proj]) => {
            const prog = State.getProjectProgress(key);
            const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: var(--fs-small); margin-bottom: 4px; font-weight: var(--fw-semibold);">
                  <span>${proj.icon} ${proj.name}</span>
                  <span style="color: var(--text-muted);">${prog.completed}/${prog.total} jours</span>
                </div>
                <div class="progress-bar" style="height: 6px; background: var(--bg-primary);">
                  <div class="progress-bar__fill" style="width: ${pct}%; background-color: ${proj.color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- XP BARS -->
      <div class="cockpit__xp-summary mt-24" id="cockpit-xp-bars"></div>
    `;

    // Init timer
    if (!isDone && !isOffDay && !notStarted) {
      Timer.init(90, 'data', null, () => {
        XP.showToast('⏰ 90 minutes écoulées ! Fais une pause de 15 min.', 'success');
      });
      Timer.renderCircle('cockpit-timer');
    }

    // XP bars
    XP.renderAllBars('cockpit-xp-bars');

    // Bind complete button
    this._bindComplete(sprintId, dayIndex);

    // Bind resources button
    this._bindResources(sprintId);

    // Highlight COG SOIR if it's past 18h
    this._checkCogSoir();

    // Start inactivity watch
    Timer.startInactivityWatch(() => {
      this._showBlockedProtocol();
    });
  },

  _bindComplete(sprintId, dayIndex) {
    const btn = document.getElementById('cockpit-complete-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      this._showCompleteModal(sprintId, dayIndex);
    });
  },

  _showCompleteModal(sprintId, dayIndex) {
    // Create modal
    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    backdrop.id = 'complete-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'complete-modal';
    modal.innerHTML = `
      <button class="modal__close" id="complete-modal-close">✕</button>
      <div class="modal__title">🎯 Qu'est-ce que tu as produit ?</div>
      <div class="modal__text">Décris en une ligne ce que tu as accompli aujourd'hui. Même petit, c'est un output.</div>
      <textarea class="textarea" id="complete-output-input" placeholder="Ex: Premier commit GitHub avec un fichier Python..." rows="3"></textarea>
      <div style="margin-top: var(--space-16); display: flex; gap: var(--space-8);">
        <button class="btn btn--success btn--full" id="complete-submit-btn">Valider ✓</button>
      </div>
      <div id="complete-error" style="color: var(--color-error); font-size: var(--fs-small); margin-top: var(--space-8); display: none;">
        Écris au moins une ligne pour valider.
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      modal.classList.add('visible');
    });

    // Focus textarea
    document.getElementById('complete-output-input')?.focus();

    // Close handlers
    const close = () => {
      backdrop.classList.remove('visible');
      modal.classList.remove('visible');
      setTimeout(() => {
        backdrop.remove();
        modal.remove();
      }, 200);
    };

    backdrop.addEventListener('click', close);
    document.getElementById('complete-modal-close')?.addEventListener('click', close);

    // Submit handler
    document.getElementById('complete-submit-btn')?.addEventListener('click', () => {
      const output = document.getElementById('complete-output-input')?.value?.trim();
      if (!output) {
        document.getElementById('complete-error').style.display = 'block';
        return;
      }

      // Complete the day
      State.completeDay(sprintId, dayIndex, output);

      // Award XP
      XP.award('data');
      XP.award('creative');

      close();

      // Check if sprint is completed
      if (State.isSprintCompleted(sprintId)) {
        const sprint = Data.getSprint(sprintId);
        setTimeout(() => {
          XP.showCelebration(sprint.title, sprint.challenge);
        }, 400);
      } else {
        XP.showToast(`+${XP.BASE_POINTS} XP ! Bien joué Samuel 💪`, 'success');
      }

      // Re-render cockpit
      setTimeout(() => {
        const cockpitContainer = document.getElementById('view-cockpit');
        if (cockpitContainer) this.render(cockpitContainer);
      }, 600);
    });
  },

  _bindResources(sprintId) {
    const btn = document.getElementById('cockpit-resources-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      this._showResourcesModal(sprintId);
    });
  },

  _showResourcesModal(sprintId) {
    const resources = Data.getResources(sprintId);
    const sprint = Data.getSprint(sprintId);

    let dataResources = '';
    if (resources.data) {
      dataResources = resources.data.map(r => `
        <div class="resource-item">
          <span class="resource-item__icon">📖</span>
          <div>
            <a href="${r.url}" target="_blank" rel="noopener" class="resource-item__name">${Utils.escapeHtml(r.name)}</a>
            <div class="resource-item__desc">${Utils.escapeHtml(r.desc)}</div>
          </div>
        </div>
      `).join('');
    }

    let creativeResources = '';
    if (resources.creative) {
      creativeResources = resources.creative.map(r => `
        <div class="resource-item">
          <span class="resource-item__icon">🎨</span>
          <div>
            <a href="${r.url}" target="_blank" rel="noopener" class="resource-item__name">${Utils.escapeHtml(r.name)}</a>
            <div class="resource-item__desc">${Utils.escapeHtml(r.desc)}</div>
          </div>
        </div>
      `).join('');
    }

    let gitCommands = '';
    if (resources.git_commands) {
      gitCommands = `
        <div style="margin-top: var(--space-16);">
          <div class="section-label section-label--data">COMMANDES GIT ESSENTIELLES</div>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-6); margin-top: var(--space-8);">
            ${resources.git_commands.map(cmd => `<code style="padding: 4px 10px; background: var(--bg-primary); border-radius: var(--radius-sm); font-size: var(--fs-small); color: var(--accent-data);">${Utils.escapeHtml(cmd)}</code>`).join('')}
          </div>
        </div>
      `;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <button class="modal__close" onclick="this.closest('.modal').remove(); document.querySelector('.backdrop').remove();">✕</button>
      <div class="modal__title">📚 Ressources — Sprint ${sprintId}</div>
      ${dataResources ? `<div class="section-label section-label--data mt-16">DATA</div><div class="resource-list">${dataResources}</div>` : ''}
      ${creativeResources ? `<div class="section-label section-label--creative mt-16">CRÉATIF</div><div class="resource-list">${creativeResources}</div>` : ''}
      ${gitCommands}
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      modal.classList.add('visible');
    });
    backdrop.addEventListener('click', () => {
      backdrop.remove();
      modal.remove();
    });
  },

  _showBlockedProtocol() {
    const protocol = Data.getBlockedProtocol();
    if (!protocol) return;

    const steps = protocol.steps.map(s => `
      <div style="display: flex; gap: var(--space-12); align-items: flex-start; margin-bottom: var(--space-12);">
        <span style="font-size: 1.2rem; flex-shrink: 0;">${s.icon}</span>
        <div>
          <span style="font-weight: var(--fw-semibold); color: var(--text-primary);">${s.number}.</span>
          <span style="color: var(--text-secondary);">${Utils.escapeHtml(s.action)}</span>
        </div>
      </div>
    `).join('');

    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <button class="modal__close" onclick="this.closest('.modal').remove(); document.querySelector('.backdrop').remove();">✕</button>
      <div class="modal__title">${protocol.title}</div>
      <div class="modal__text">${protocol.subtitle}</div>
      ${steps}
      <button class="btn btn--primary btn--full mt-16" onclick="this.closest('.modal').remove(); document.querySelector('.backdrop').remove();">
        C'est reparti 💪
      </button>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      modal.classList.add('visible');
    });
    backdrop.addEventListener('click', () => {
      backdrop.remove();
      modal.remove();
    });

    // Reset inactivity watch
    Timer._resetInactivity();
  },

  _checkCogSoir() {
    const now = new Date();
    const cogElement = document.getElementById('cockpit-cog-soir');
    if (cogElement && now.getHours() >= 18) {
      cogElement.style.opacity = '1';
      cogElement.style.borderLeft = '3px solid var(--accent-langue)';
    }
  },

  destroy() {
    Timer.stop();
    Timer.stopInactivityWatch();
  }
};
