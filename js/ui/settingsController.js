/* ============================================================
 * Ludo Master - ui/settingsController.js
 * Settings modal: theme, sound, animation/AI speed, helpers and
 * the six rule toggles. Everything persists immediately.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const SettingsController = {
    init() {
      const openBtns = LUDO.Utils.qsa('[data-open="modal-settings"]');
      openBtns.forEach((b) => b.addEventListener('click', () => {
        SettingsController.sync();
        LUDO.ModalManager.open('modal-settings');
      }));

      SettingsController.bindBasic();
      SettingsController.bindRules();
      SettingsController.bindSwatches();
      SettingsController.bindReset();

      LUDO.Bus.on('settings:changed', () => SettingsController.sync());
    },

    bindBasic() {
      const sound = LUDO.Utils.qs('#set-sound');
      const volume = LUDO.Utils.qs('#set-volume');
      const anim = LUDO.Utils.qs('#set-anim');
      const aispeed = LUDO.Utils.qs('#set-aispeed');
      const automove = LUDO.Utils.qs('#set-automove');
      const highlights = LUDO.Utils.qs('#set-highlights');

      if (sound) sound.addEventListener('change', () => {
        LUDO.State.settings.sound = sound.checked;
        LUDO.State.saveSettings();
      });
      if (volume) volume.addEventListener('input', () => {
        LUDO.State.settings.volume = parseFloat(volume.value);
        SettingsController.paintVolume(volume);
        LUDO.State.saveSettings();
      });
      if (anim) anim.addEventListener('change', () => {
        LUDO.State.settings.animSpeed = anim.value;
        LUDO.State.saveSettings();
      });
      if (aispeed) aispeed.addEventListener('change', () => {
        LUDO.State.settings.aiSpeed = aispeed.value;
        LUDO.State.saveSettings();
      });
      if (automove) automove.addEventListener('change', () => {
        LUDO.State.settings.autoMoveSingle = automove.checked;
        LUDO.State.saveSettings();
      });
      if (highlights) highlights.addEventListener('change', () => {
        LUDO.State.settings.showHighlights = highlights.checked;
        LUDO.State.saveSettings();
      });
    },

    bindRules() {
      LUDO.Utils.qsa('[data-rule]').forEach((box) => {
        box.addEventListener('change', () => {
          const key = box.getAttribute('data-rule');
          LUDO.State.rules[key] = box.checked;
          LUDO.State.saveSettings();
          LUDO.Bus.emit('rules:changed', { key, value: box.checked });
        });
      });
    },

    bindSwatches() {
      LUDO.Utils.qsa('.swatch').forEach((sw) => {
        sw.addEventListener('click', () => {
          LUDO.ThemeManager.set(sw.getAttribute('data-theme-value'));
          SettingsController.sync();
        });
      });
    },

    bindReset() {
      const btn = LUDO.Utils.qs('#set-reset-stats');
      if (btn) btn.addEventListener('click', () => {
        LUDO.State.resetStats();
        LUDO.MenuController.refreshQuickStats();
        LUDO.Toast.show(LUDO.I18N.t('statsCleared'), 'info');
      });
    },

    /** Paint the filled portion of the volume slider + % readout. */
    paintVolume(input) {
      if (!input) return;
      const pct = Math.round((parseFloat(input.value) || 0) * 100);
      input.style.setProperty('--vol', pct + '%');
      const out = document.getElementById('set-volume-val');
      if (out) out.textContent = pct + '%';
    },

    /** Push current settings into the modal controls. */
    sync() {
      const s = LUDO.State.settings;
      const map = {
        'set-sound': s.sound,
        'set-volume': s.volume,
        'set-anim': s.animSpeed,
        'set-aispeed': s.aiSpeed,
        'set-automove': s.autoMoveSingle,
        'set-highlights': s.showHighlights
      };
      Object.keys(map).forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = !!map[id];
        else el.value = map[id];
      });
      SettingsController.paintVolume(document.getElementById('set-volume'));
      LUDO.Utils.qsa('[data-rule]').forEach((box) => {
        const key = box.getAttribute('data-rule');
        if (LUDO.State.rules[key] != null) box.checked = !!LUDO.State.rules[key];
      });
      LUDO.Utils.qsa('.swatch').forEach((sw) => {
        const on = sw.getAttribute('data-theme-value') === LUDO.ThemeManager.current();
        sw.classList.toggle('active', on);
        sw.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
  };

  LUDO.SettingsController = SettingsController;
})();
