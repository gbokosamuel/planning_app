/* ═══════════════════════════════════════════════════
   ONBOARDING — Premier lancement
   ═══════════════════════════════════════════════════ */

const Onboarding = {
  async render(container) {
    const checklist = Data.getOnboardingChecklist();
    const saved = State.getOnboardingChecklist();
    const blenderProject = State.getBlenderProject();
    const startDate = State.getStartDate() || Utils.todayStr();
    const totalItems = [...(checklist.data || []), ...(checklist.creative || []), ...(checklist.languages || [])].length;
    const checkedCount = State.getOnboardingCheckedCount();

    const renderSection = (title, badge, items) => {
      if (!items || items.length === 0) return '';
      return `
        <div class="onboarding__section">
          <div class="onboarding__section-title">
            <span class="badge ${badge}">${title}</span>
          </div>
          <div class="onboarding__checklist">
            ${items.map(item => {
              const isChecked = saved[item.id] === true;
              return `
                <div class="checkbox-item ${isChecked ? 'checked' : ''}" data-id="${item.id}">
                  <div class="checkbox-item__box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span class="checkbox-item__text">${Utils.escapeHtml(item.label)}</span>
                  ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="checkbox-item__link" onclick="event.stopPropagation();">↗ Lien</a>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="onboarding__header">
        <div class="onboarding__emoji">🚀</div>
        <h1 class="onboarding__title">Bienvenue Samuel</h1>
        <p class="onboarding__subtitle">Prépare ton environnement de travail avant de commencer les défis.</p>
      </div>

      ${renderSection('DATA', 'badge--data', checklist.data)}
      ${renderSection('CRÉATIF', 'badge--creative', checklist.creative)}
      ${renderSection('LANGUES', 'badge--langue', checklist.languages)}

      <!-- Blender Project -->
      <div class="onboarding__blender-section">
        <div class="onboarding__blender-title">🎨 Ton projet Blender</div>
        <div class="onboarding__blender-desc">
          Choisis UN projet 3D que tu vas construire du début à la fin (ex : écouteurs, bouteille, logo 3D animé). 
          Chaque session Blender avancera vers ce render final.
        </div>
        <input type="text" class="input" id="onboarding-blender-input"
          placeholder="Ex: Render d'écouteurs sans fil pour mon portfolio"
          value="${Utils.escapeHtml(blenderProject)}">
      </div>

      <!-- Start Date -->
      <div class="onboarding__date-section">
        <div class="onboarding__date-title">📅 Date de début</div>
        <div class="onboarding__date-desc">Quand commences-tu le Sprint 1 ?</div>
        <input type="date" class="input input--date" id="onboarding-date-input" value="${startDate}">
      </div>

      <!-- CTA -->
      <div class="onboarding__cta">
        <div class="onboarding__counter">
          <span>${checkedCount}</span> / ${totalItems} outils installés
        </div>
        <button class="btn btn--primary btn--full" id="onboarding-start-btn" style="padding: var(--space-16) var(--space-24); font-size: 1.1rem;">
          🚀 C'est parti !
        </button>
      </div>
    `;

    // Bind checkboxes
    container.querySelectorAll('.checkbox-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const isChecked = item.classList.toggle('checked');
        State.setOnboardingCheckItem(id, isChecked);

        // Update counter
        const counter = container.querySelector('.onboarding__counter span');
        if (counter) counter.textContent = State.getOnboardingCheckedCount();
      });
    });

    // Bind blender input
    const blenderInput = document.getElementById('onboarding-blender-input');
    if (blenderInput) {
      blenderInput.addEventListener('input', Utils.debounce(() => {
        State.setBlenderProject(blenderInput.value);
      }, 500));
    }

    // Bind date input
    const dateInput = document.getElementById('onboarding-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', () => {
        State.setStartDate(dateInput.value);
      });
    }

    // Bind start button
    document.getElementById('onboarding-start-btn')?.addEventListener('click', () => {
      // Save date if not already saved
      const date = document.getElementById('onboarding-date-input')?.value;
      if (date) State.setStartDate(date);

      // Save blender project
      const blender = document.getElementById('onboarding-blender-input')?.value;
      if (blender) State.setBlenderProject(blender);

      State.setOnboardingDone(true);

      // Navigate to cockpit
      if (typeof App !== 'undefined') {
        App.navigate('cockpit');
      }

      XP.showToast('Setup terminé ! Ton aventure commence. 🔥', 'success');
    });
  },

  destroy() {
    // Nothing to clean up
  }
};
