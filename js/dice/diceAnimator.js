/* ============================================================
 * Ludo Master - dice/diceAnimator.js
 * Shake-and-flicker roll animation ending on the final value.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const DiceAnimator = {
    async rollTo(value, color) {
      const dice = LUDO.Utils.qs('#dice');
      if (!dice) return;

      dice.classList.add('rolling');
      const duration = LUDO.CONST.DICE_MS;
      const start = Date.now();

      while (Date.now() - start < duration) {
        LUDO.DiceRenderer.render(LUDO.Utils.randInt(1, 6), color);
        await LUDO.Utils.sleep(85);
      }

      LUDO.DiceRenderer.render(value, color);
      dice.classList.remove('rolling');
      dice.classList.add('landed');
      setTimeout(() => dice.classList.remove('landed'), 300);
      await LUDO.Utils.sleep(120);
    }
  };

  LUDO.DiceAnimator = DiceAnimator;
})();
