/* ═══════════════════════════════════════════════════
   SPRINT — Vue carte de mission
   ═══════════════════════════════════════════════════ */

const Sprint = {
  _selectedSprintId: null,

  async render(container) {
    const startDate = State.getStartDate();
    const position = startDate ? Data.getCurrentPosition(startDate) : { sprintId: 1, dayIndex: 0 };
    let initialSprintId = this._selectedSprintId || position.sprintId;
    
    const sprints = Data.getSprints();
    
    // Check for locked sprints and clamp selected sprint
    let maxUnlockedSprintId = 1;
    for (let i = 0; i < sprints.length; i++) {
      if (i > 0 && !State.isSprintCompleted(sprints[i - 1].id)) break;
      maxUnlockedSprintId = sprints[i].id;
    }
    if (initialSprintId > maxUnlockedSprintId) {
      initialSprintId = maxUnlockedSprintId;
    }
    this._selectedSprintId = initialSprintId;

    const sprint = Data.getSprint(this._selectedSprintId);
    if (!sprint) return;
    const creativeProjects = Data.getCreativeProjects();

    const totalDays = Data.getSprintDayCount(this._selectedSprintId);
    const completedDays = State.getCompletedCountForSprint(this._selectedSprintId);
    const progressPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    const endDate = startDate ? Data.getSprintEndDate(this._selectedSprintId, startDate) : null;

    // Sprint selector pills
    const selectorHtml = sprints.map((s, index) => {
      const isActive = s.id === this._selectedSprintId;
      const isDone = State.isSprintCompleted(s.id);
      
      let isLocked = false;
      if (index > 0) {
        isLocked = !State.isSprintCompleted(sprints[index - 1].id);
      }

      return `<button class="sprint__selector-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-sprint-id="${s.id}" ${isLocked ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
        ${isLocked ? '🔒 ' : (isDone ? '✓ ' : '')}S${s.id}
      </button>`;
    }).join('');

    // Group days by week
    const weeks = {};
    sprint.track_data.days.forEach(day => {
      if (!weeks[day.week]) weeks[day.week] = [];
      weeks[day.week].push(day);
    });

    let daysHtml = '';
    for (const [weekNum, days] of Object.entries(weeks)) {
      daysHtml += `<div class="sprint__week-label">Semaine ${weekNum}</div>`;
      daysHtml += days.map(day => {
        const isCompleted = State.isDayCompleted(this._selectedSprintId, day.day_index);
        const isCurrent = this._selectedSprintId === position.sprintId && day.day_index === position.dayIndex;
        const completedData = isCompleted ? State.getCompletedDays()[`S${this._selectedSprintId}-D${day.day_index}`] : null;
        const actualDate = Data.getCalendarDate(this._selectedSprintId, day.day_index, State.getStartDate());
        const dayNameStr = Utils.capitalize(Utils.getDayName(actualDate));

        return `
          <div class="sprint__day ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
            <div class="sprint__day-number">
              ${isCompleted ? '✓' : day.day_index + 1}
            </div>
            <div class="sprint__day-content">
              <div class="sprint__day-name">${dayNameStr} S${day.week}</div>
              
              <div style="margin-top: 8px;">
                <span class="badge badge--data" style="font-size: 10px;">DATA</span>
                <div class="sprint__day-task" style="margin-top: 4px;">${Utils.escapeHtml(day.task)}</div>
                <div class="sprint__day-output-text">→ ${Utils.escapeHtml(day.output)}</div>
              </div>

              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed var(--border-color);">
                <span class="badge" style="font-size: 10px; background-color: ${creativeProjects[day.creative_project]?.color}20; color: ${creativeProjects[day.creative_project]?.color}; border: 1px solid ${creativeProjects[day.creative_project]?.color}40;">
                  ${creativeProjects[day.creative_project]?.icon || '🎨'} ${Utils.escapeHtml(creativeProjects[day.creative_project]?.name || 'CRÉATIF').toUpperCase()}
                </span>
                <div class="sprint__day-task" style="margin-top: 4px;">${Utils.escapeHtml(day.creative_task)}</div>
                <div class="sprint__day-output-text" style="color: ${creativeProjects[day.creative_project]?.color};">→ ${Utils.escapeHtml(day.creative_output)}</div>
              </div>

              ${completedData?.output ? `<div style="margin-top: var(--space-8); font-size: var(--fs-label); color: var(--color-success); font-weight: 500;">✓ ${Utils.escapeHtml(completedData.output)}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = `
      <!-- Sprint Selector -->
      <div class="sprint__selector" id="sprint-selector">
        ${selectorHtml}
      </div>

      <!-- Header -->
      <div class="sprint__header">
        <div class="sprint__current-label">SPRINT ${sprint.id}</div>
        <div class="sprint__title">${Utils.escapeHtml(sprint.title)}</div>
        <div class="sprint__challenge">${Utils.escapeHtml(sprint.challenge)}</div>
      </div>

      <!-- Progress -->
      <div class="sprint__progress">
        <div class="sprint__progress-header">
          <span class="sprint__progress-text">${completedDays} / ${totalDays} jours</span>
          <span class="sprint__progress-pct">${progressPct}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill" style="width: ${progressPct}%"></div>
        </div>
        ${endDate ? `<div class="sprint__deadline">Livraison estimée : ${Utils.formatDate(endDate)}</div>` : ''}
      </div>

      <!-- Days -->
      <div class="sprint__days">
        ${daysHtml}
      </div>
    `;

    // Bind sprint selector
    document.querySelectorAll('.sprint__selector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._selectedSprintId = parseInt(btn.dataset.sprintId);
        this.render(container);
      });
    });
  },

  destroy() {
    // Nothing to clean up
  }
};
