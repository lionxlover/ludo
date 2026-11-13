/* ============================================================
 * Ludo Master - ui/keyboardController.js
 * Space = roll, 1-4 = pick token, Esc = close/pause,
 * M = mute, P = pause, T = theme.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const KeyboardController = {
    init() {
      document.addEventListener('keydown', KeyboardController.onKey);
    },

    onKey(e) {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select';

      if (e.key === 'Escape') {
        if (LUDO.ModalManager.isOpenAny()) {
          const top = LUDO.ModalManager.topOpen();
          const modal = document.getElementById(top);
          if (modal && modal.hasAttribute('data-static')) return;  // pause: use buttons
          LUDO.ModalManager.closeAll();
        } else if (LUDO.ScreenManager.current === 'game' && LUDO.State.game && !LUDO.State.game.over) {
          LUDO.PauseController.toggle(true);
        }
        return;
      }

      if (typing) return;

      const key = e.key.toLowerCase();

      if (e.key === ' ' || e.key === 'Enter') {
        /* A focused button/link handles its own Space/Enter (the dice is a
         * div, so it falls through to the roll below). */
        if (e.target && e.target.closest && e.target.closest('button, a[href]')) return;
        if (LUDO.ScreenManager.current !== 'game') return;
        if (LUDO.ModalManager.isOpenAny()) return;
        e.preventDefault();
        LUDO.DiceController.requestRoll();
        return;
      }

      if (key === 'm') {
        LUDO.State.settings.sound = !LUDO.State.settings.sound;
        LUDO.State.saveSettings();
        LUDO.GameScreenController.syncSound();
        return;
      }
      if (key === 'p') {
        if (LUDO.ScreenManager.current === 'game') {
          LUDO.PauseController.toggle(!LUDO.State.paused);
        }
        return;
      }
      if (key === 't') { LUDO.ThemeManager.cycle(); return; }

      if (['1', '2', '3', '4'].indexOf(key) >= 0) {
        const game = LUDO.State.game;
        if (!game || game.phase !== LUDO.CONST.PHASE.CHOOSING) return;
        const moves = game.lastMoves || [];
        const sorted = moves.slice().sort((a, b) => a.token.idx - b.token.idx);
        const move = sorted[parseInt(key, 10) - 1];
        if (move) LUDO.GameController.chooseMove(move);
      }
    }
  };

  LUDO.KeyboardController = KeyboardController;
})();
