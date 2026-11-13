/* ============================================================
 * Ludo Master - dice/diceController.js
 * Roll button / dice click handling; the actual flow lives in
 * LUDO.GameController.roll().
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const DiceController = {
    enabled: false,

    init() {
      const btn = LUDO.Utils.qs('#btn-roll');
      const dice = LUDO.Utils.qs('#dice');
      if (btn) {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          DiceController.requestRoll();
        });
      }
      if (dice) {
        dice.addEventListener('click', () => DiceController.requestRoll());
      }
      LUDO.DiceRenderer.init();
      LUDO.DiceRenderer.renderIdle();
    },

    /** User asked for a roll (button, dice click or keyboard). */
    requestRoll() {
      if (!DiceController.enabled) return;
      LUDO.Bus.emit('ui:click', { source: 'roll' });
      LUDO.GameController.roll();
    },

    enable() {
      DiceController.enabled = true;
      LUDO.DiceRenderer.enable(true);
    },

    disable() {
      DiceController.enabled = false;
      LUDO.DiceRenderer.enable(false);
    }
  };

  LUDO.DiceController = DiceController;
})();
