/* ═══════════════════════════════════════════════════
   DATA — Loads sprints.json and provides access
   ═══════════════════════════════════════════════════ */

const Data = {
  _data: null,

  /**
   * Load sprints.json (cached after first load)
   */
  async load() {
    if (this._data) return this._data;
    try {
      const resp = await fetch('./data/sprints.json');
      this._data = await resp.json();
      return this._data;
    } catch (e) {
      console.error('Failed to load sprints.json:', e);
      return null;
    }
  },

  /**
   * Get all sprints
   */
  getSprints() {
    return this._data?.sprints || [];
  },

  /**
   * Get a sprint by ID (1-indexed)
   */
  getSprint(id) {
    return this.getSprints().find(s => s.id === id);
  },

  /**
   * Get a specific day within a sprint
   */
  getDay(sprintId, dayIndex) {
    const sprint = this.getSprint(sprintId);
    if (!sprint) return null;
    return sprint.track_data.days.find(d => d.day_index === dayIndex) || null;
  },

  /**
   * Get total days in a sprint
   */
  getSprintDayCount(sprintId) {
    const sprint = this.getSprint(sprintId);
    return sprint ? sprint.track_data.days.length : 0;
  },

  /**
   * Calculate which sprint and day index based on start date and current date
   * Returns { sprintId, dayIndex, globalDayIndex, isOffDay }
   */
  getCurrentPosition(startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDaysPassed = Utils.daysBetween(start, today);

    if (totalDaysPassed < 0) {
      return { sprintId: 1, dayIndex: 0, globalDayIndex: 0, isOffDay: false, notStarted: true };
    }

    // Check if today is Monday (off day)
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
    if (dayOfWeek === 1) {
      // Find the position as if it were the next working day
      const pos = this._calculatePosition(totalDaysPassed, start);
      return { ...pos, isOffDay: true };
    }

    return this._calculatePosition(totalDaysPassed, start);
  },

  _calculatePosition(totalDaysPassed, startDate) {
    // Count working days (all days except Mondays)
    let workingDays = 0;
    for (let i = 0; i <= totalDaysPassed; i++) {
      const d = Utils.addDays(startDate, i);
      if (d.getDay() !== 1) { // Not Monday
        workingDays++;
      }
    }
    // workingDays is 1-indexed (first working day = 1)
    const workingDayIndex = workingDays - 1; // 0-indexed

    // Determine sprint and day within sprint
    const sprints = this.getSprints();
    let cumulativeDays = 0;
    for (const sprint of sprints) {
      const sprintDays = sprint.track_data.days.length;
      if (workingDayIndex < cumulativeDays + sprintDays) {
        return {
          sprintId: sprint.id,
          dayIndex: workingDayIndex - cumulativeDays,
          globalDayIndex: workingDayIndex,
          isOffDay: false
        };
      }
      cumulativeDays += sprintDays;
    }

    // Past all sprints — show last day of last sprint
    const lastSprint = sprints[sprints.length - 1];
    return {
      sprintId: lastSprint.id,
      dayIndex: lastSprint.track_data.days.length - 1,
      globalDayIndex: cumulativeDays - 1,
      isOffDay: false,
      completed: true
    };
  },

  /**
   * Get the estimated end date for a sprint
   */
  getSprintEndDate(sprintId, startDate) {
    const sprints = this.getSprints();
    let cumulativeDays = 0;
    for (const sprint of sprints) {
      const sprintDays = sprint.track_data.days.length;
      if (sprint.id === sprintId) {
        const endWorkingDay = cumulativeDays + sprintDays;
        // Convert working days to calendar days (add Mondays)
        let calendarDays = 0;
        let workingCount = 0;
        const start = new Date(startDate);
        while (workingCount < endWorkingDay) {
          calendarDays++;
          const d = Utils.addDays(start, calendarDays);
          if (d.getDay() !== 1) workingCount++;
        }
        return Utils.addDays(start, calendarDays);
      }
      cumulativeDays += sprintDays;
    }
    return null;
  },

  /**
   * Get total working days in the entire program
   */
  getTotalDays() {
    return this.getSprints().reduce((sum, s) => sum + s.track_data.days.length, 0);
  },

  /**
   * Get blocked protocol data
   */
  getBlockedProtocol() {
    return this._data?.blocked_protocol || null;
  },

  /**
   * Get language data
   */
  getLanguages() {
    return this._data?.languages || {};
  },

  /**
   * Get COG soir data
   */
  getCogSoir() {
    return this._data?.cog_soir || null;
  },

  /**
   * Get onboarding checklist
   */
  getOnboardingChecklist() {
    return this._data?.onboarding_checklist || {};
  },

  /**
   * Get badges
   */
  getBadges() {
    return this._data?.badges || [];
  },

  /**
   * Get resources for a sprint
   */
  getResources(sprintId) {
    const sprint = this.getSprint(sprintId);
    return sprint?.resources || {};
  },

  /**
   * Get schedule info
   */
  getSchedule() {
    return this._data?.schedule || {};
  },

  /**
   * Get creative projects metadata
   */
  getCreativeProjects() {
    return this._data?.creative_projects || {};
  }
};
