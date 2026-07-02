/* ═══════════════════════════════════════════════════
   STATE — localStorage persistence
   ═══════════════════════════════════════════════════ */

const State = {
  _prefix: 'samuel_',

  /* ── Core getters/setters ── */

  _get(key, fallback = null) {
    try {
      const val = localStorage.getItem(this._prefix + key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },

  _set(key, value) {
    try {
      localStorage.setItem(this._prefix + key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage write error:', e);
    }
  },

  /* ── Onboarding ── */

  isOnboardingDone() {
    return this._get('onboarding_done', false);
  },

  setOnboardingDone(val = true) {
    this._set('onboarding_done', val);
  },

  getOnboardingChecklist() {
    return this._get('onboarding_checklist', {});
  },

  setOnboardingCheckItem(id, checked) {
    const checklist = this.getOnboardingChecklist();
    checklist[id] = checked;
    this._set('onboarding_checklist', checklist);
  },

  getOnboardingCheckedCount() {
    const checklist = this.getOnboardingChecklist();
    return Object.values(checklist).filter(Boolean).length;
  },

  /* ── Start Date ── */

  getStartDate() {
    return this._get('start_date', null);
  },

  setStartDate(dateStr) {
    this._set('start_date', dateStr);
  },

  /* ── Blender Project ── */

  getBlenderProject() {
    return this._get('blender_project', '');
  },

  setBlenderProject(text) {
    this._set('blender_project', text);
  },

  /* ── Completed Days ── */

  getCompletedDays() {
    return this._get('completed_days', {});
  },

  isDayCompleted(sprintId, dayIndex) {
    const key = `S${sprintId}-D${dayIndex}`;
    const completed = this.getCompletedDays();
    return completed[key]?.completed === true;
  },

  isDayPartial(sprintId, dayIndex) {
    const key = `S${sprintId}-D${dayIndex}`;
    const completed = this.getCompletedDays();
    return completed[key]?.partial === true;
  },

  completeDay(sprintId, dayIndex, output) {
    const completed = this.getCompletedDays();
    const key = `S${sprintId}-D${dayIndex}`;
    completed[key] = {
      completed: true,
      partial: false,
      output: output,
      date: Utils.todayStr()
    };
    this._set('completed_days', completed);

    // Add to outputs list
    this.addOutput(output, sprintId, dayIndex);

    // Update streak
    this.updateStreak();
  },

  getCompletedCountForSprint(sprintId) {
    const completed = this.getCompletedDays();
    let count = 0;
    for (const key in completed) {
      if (key.startsWith(`S${sprintId}-`) && completed[key].completed) {
        count++;
      }
    }
    return count;
  },

  isSprintCompleted(sprintId) {
    const totalDays = Data.getSprintDayCount(sprintId);
    return this.getCompletedCountForSprint(sprintId) >= totalDays;
  },

  /* ── XP ── */

  getXP() {
    return this._get('xp', { data: 0, creative: 0, langue: 0 });
  },

  addXP(track, amount) {
    const xp = this.getXP();
    xp[track] = (xp[track] || 0) + amount;
    this._set('xp', xp);
    return xp;
  },

  getTotalXP() {
    const xp = this.getXP();
    return xp.data + xp.creative + xp.langue;
  },

  /* ── Streak ── */

  getStreak() {
    return this._get('streak', { current: 0, best: 0, lastDate: null });
  },

  updateStreak() {
    const streak = this.getStreak();
    const today = Utils.todayStr();

    if (streak.lastDate === today) {
      return streak; // Already counted today
    }

    if (streak.lastDate) {
      const daysSince = Utils.daysBetween(streak.lastDate, today);
      if (daysSince === 1 || (daysSince === 2 && new Date(today).getDay() === 2)) {
        // Consecutive day OR Tuesday after Monday (off day)
        streak.current += 1;
      } else {
        streak.current = 1; // Reset
      }
    } else {
      streak.current = 1;
    }

    streak.lastDate = today;
    if (streak.current > streak.best) {
      streak.best = streak.current;
    }

    this._set('streak', streak);
    return streak;
  },

  /* ── Outputs ── */

  getOutputs() {
    return this._get('outputs', []);
  },

  addOutput(text, sprintId, dayIndex) {
    if (!text || !text.trim()) return;
    const outputs = this.getOutputs();
    outputs.push({
      text: text.trim(),
      sprintId,
      dayIndex,
      date: Utils.todayStr(),
      id: Utils.uid()
    });
    this._set('outputs', outputs);
  },

  /* ── Timer State ── */

  getTimerState() {
    return this._get('timer_state', null);
  },

  setTimerState(state) {
    this._set('timer_state', state);
  },

  clearTimerState() {
    localStorage.removeItem(this._prefix + 'timer_state');
  },

  /* ── Global Day Status (for the grid) ── */

  /**
   * Returns an array of { date, status } for each working day
   * status: 'completed' | 'partial' | 'missed' | 'future'
   */
  getDayStatuses(startDate) {
    if (!startDate) return [];
    const completed = this.getCompletedDays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const totalDays = Data.getTotalDays();

    const statuses = [];
    let workingDayIndex = 0;
    let currentCalendarDay = new Date(start);

    // Map global working day index to sprint+day
    const sprints = Data.getSprints();
    const dayMap = [];
    for (const sprint of sprints) {
      for (const day of sprint.track_data.days) {
        dayMap.push({ sprintId: sprint.id, dayIndex: day.day_index });
      }
    }

    // Walk through calendar days
    while (workingDayIndex < totalDays) {
      if (currentCalendarDay.getDay() !== 1) { // Not Monday
        const mapping = dayMap[workingDayIndex];
        const key = `S${mapping.sprintId}-D${mapping.dayIndex}`;
        const dayData = completed[key];

        let status;
        if (currentCalendarDay > today) {
          status = 'future';
        } else if (dayData?.completed) {
          status = 'completed';
        } else if (dayData?.partial) {
          status = 'partial';
        } else if (currentCalendarDay < today) {
          status = 'missed';
        } else {
          status = 'today';
        }

        statuses.push({
          date: new Date(currentCalendarDay),
          status,
          sprintId: mapping.sprintId,
          dayIndex: mapping.dayIndex
        });

        workingDayIndex++;
      }

      currentCalendarDay = Utils.addDays(currentCalendarDay, 1);
    }

    return statuses;
  },

  /* ── Reset (for testing) ── */

  resetAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this._prefix));
    keys.forEach(k => localStorage.removeItem(k));
  },

  /* ── Creative Projects Progress ── */

  getProjectProgress(projectId) {
    const completed = this.getCompletedDays();
    let completedCount = 0;
    
    for (const key in completed) {
      if (completed[key].completed) {
        const match = key.match(/S(\d+)-D(\d+)/);
        if (match) {
          const sId = parseInt(match[1]);
          const dId = parseInt(match[2]);
          const day = Data.getDay(sId, dId);
          if (day && day.creative_project === projectId) {
            completedCount++;
          }
        }
      }
    }
    return { completed: completedCount, total: 26 }; // 26 is the total number of days per project
  }
};
