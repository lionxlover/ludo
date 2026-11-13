/* ============================================================
 * Ludo Master - core/main.js
 * Bootstrap: restore persisted state, initialize every module
 * in dependency order, wire global click sounds.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  function init() {
    /* Surface async failures loudly instead of freezing the game. */
    window.addEventListener('unhandledrejection', (ev) => {
      LUDO.Log.error('Unhandled rejection', ev.reason);
    });
    window.addEventListener('error', (ev) => {
      LUDO.Log.error('Window error: ' + ev.message);
    });

    LUDO.State.loadSettings();
    LUDO.State.loadStats();

    /* UI chrome */
    LUDO.ScreenManager.init();
    LUDO.ModalManager.init();
    LUDO.Toast.init();
    LUDO.Sound.init();

    /* game screen widgets */
    LUDO.DiceRenderer.init();
    LUDO.DiceController.init();
    LUDO.DiceHistory.init();
    LUDO.PlayerRenderer.init();
    LUDO.HistoryLogger.init();
    LUDO.Confetti.init();

    /* controllers */
    LUDO.ThemeManager.init();
    LUDO.MenuController.init();
    LUDO.SettingsController.init();
    LUDO.StatsController.init();
    LUDO.HelpController.init();
    LUDO.GameScreenController.init();
    LUDO.PauseController.init();
    LUDO.KeyboardController.init();

    /* i18n text pass + resume button */
    LUDO.I18N.apply();
    LUDO.MenuController.refreshResume();
    LUDO.SettingsController.sync();

    /* subtle click sound on primary buttons */
    document.addEventListener('click', (ev) => {
      const target = ev.target.closest('.btn, .seg-btn, .swatch, .icon-btn, .mode-btn, .tool-btn, .row-btn');
      if (target && !target.disabled) LUDO.Bus.emit('ui:click', { source: 'button' });
    });

    LUDO.Log.info('Ludo Master v' + LUDO.CONST.VERSION + ' ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  LUDO.Main = { init };
})();
