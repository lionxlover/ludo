/* ============================================================
 * Ludo Master - ui/screenManager.js
 * Switches between the menu and the game screen.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const ScreenManager = {
    current: 'menu',

    init() {
      ScreenManager.show('menu');
    },

    show(name) {
      const menu = LUDO.Utils.qs('#screen-menu');
      const game = LUDO.Utils.qs('#screen-game');
      if (menu) menu.classList.toggle('hidden', name !== 'menu');
      if (game) game.classList.toggle('hidden', name !== 'game');
      document.body.dataset.screen = name;
      ScreenManager.current = name;
      window.scrollTo(0, 0);
    }
  };

  LUDO.ScreenManager = ScreenManager;
})();
