/* ═══════════════════════════════════════════════════
   UTILS — Helpers & Formatting
   ═══════════════════════════════════════════════════ */

const Utils = {
  /**
   * Format a Date as DD/MM/YYYY
   */
  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  /**
   * Format a Date as "Mardi 15 Juillet"
   */
  formatDateLong(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  },

  /**
   * Format seconds as MM:SS
   */
  formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  /**
   * Calculate number of days between two dates
   */
  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  /**
   * Get today's date string (YYYY-MM-DD)
   */
  todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Add days to a date
   */
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  /**
   * Get the day name in French
   */
  getDayName(date) {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
  },

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Create an SVG icon from a path string
   */
  svgIcon(pathD, size = 22) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="nav-item__icon">${pathD}</svg>`;
  },

  /**
   * Simple HTML escape
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Debounce a function
   */
  debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Get a unique ID
   */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
};
