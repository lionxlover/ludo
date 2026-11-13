/* ============================================================
 * Ludo Master - game/autoPlay.js
 * Spectate mode helper: schedules automatic rematches when a
 * bot-vs-bot game finishes.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const AutoPlay = {
    armed: false,
    timer: null,

    arm(game) {
      AutoPlay.armed = !!game.spectate;
    },

    disarm() {
      AutoPlay.armed = false;
      if (AutoPlay.timer) { clearTimeout(AutoPlay.timer); AutoPlay.timer = null; }
    },

    /** Six seconds after a spectated game ends, start the rematch. */
    scheduleNext() {
      if (!AutoPlay.armed) return;
      if (AutoPlay.timer) clearTimeout(AutoPlay.timer);
      AutoPlay.timer = setTimeout(() => {
        AutoPlay.timer = null;
        const game = LUDO.State.game;
        if (AutoPlay.armed && game && game.over && game.rematchConfig) {
          LUDO.GameController.start(game.rematchConfig);
        }
      }, 6000);
    }
  };

  LUDO.AutoPlay = AutoPlay;
})();
