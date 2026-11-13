/* ============================================================
 * Ludo Master - ui/themeManager.js
 * Palette switching via data-theme on <html>.
 *   classic = Light, neon = Dark, pastel = Sorbet, wood = Walnut.
 * Until the player picks a theme the game follows the device's
 * light / dark appearance, like a native iOS app does.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const LABELS = { classic: 'Light', neon: 'Dark', pastel: 'Sorbet', wood: 'Walnut' };

  const ThemeManager = {
    THEMES: ['classic', 'neon', 'pastel', 'wood'],

    init() {
      const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
      const saved = LUDO.State.settings.theme;

      if (saved && ThemeManager.THEMES.indexOf(saved) >= 0) {
        ThemeManager.apply(saved);
      } else {
        /* No explicit choice yet: follow the system and keep following it. */
        ThemeManager.apply(mq && mq.matches ? 'neon' : 'classic');
      }
      if (mq) {
        const follow = (ev) => {
          if (!LUDO.State.settings.theme) ThemeManager.apply(ev.matches ? 'neon' : 'classic');
        };
        if (mq.addEventListener) mq.addEventListener('change', follow);
        else if (mq.addListener) mq.addListener(follow);
      }

      const cycleBtn = LUDO.Utils.qs('#btn-theme');
      if (cycleBtn) cycleBtn.addEventListener('click', () => ThemeManager.cycle());
    },

    current() {
      return document.documentElement.dataset.theme || 'classic';
    },

    /** Apply a palette without remembering it. */
    apply(theme) {
      if (ThemeManager.THEMES.indexOf(theme) < 0) theme = 'classic';
      document.documentElement.dataset.theme = theme;
      ThemeManager.syncBrowserChrome(theme);
      LUDO.Bus.emit('theme:changed', { theme });
    },

    /** Apply a palette and remember the player's choice. */
    set(theme) {
      if (ThemeManager.THEMES.indexOf(theme) < 0) theme = 'classic';
      LUDO.State.settings.theme = theme;
      LUDO.State.saveSettings();
      ThemeManager.apply(theme);
    },

    /** Keep the mobile browser chrome tinted to match the palette. */
    syncBrowserChrome(theme) {
      const colors = { classic: '#f2f2f7', neon: '#000000', pastel: '#fff4f1', wood: '#1e1511' };
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', colors[theme] || colors.classic);
    },

    cycle() {
      const cur = ThemeManager.THEMES.indexOf(ThemeManager.current());
      const next = ThemeManager.THEMES[(cur + 1) % ThemeManager.THEMES.length];
      ThemeManager.set(next);
      LUDO.Toast.show('Theme: ' + LABELS[next], 'info');
    }
  };

  LUDO.ThemeManager = ThemeManager;
})();
