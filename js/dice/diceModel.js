/* ============================================================
 * Ludo Master - dice/diceModel.js
 * Fair 1..6 roller. Counting/aggregation happens in the
 * controllers so this stays trivial and testable.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const DiceModel = {
    lastValue: null,
    rollCount: 0,

    /** Random dice value 1..6. */
    roll() {
      const value = LUDO.Utils.randInt(1, 6);
      DiceModel.lastValue = value;
      DiceModel.rollCount += 1;
      if (LUDO.State && LUDO.State.stats) {
        LUDO.State.stats.rolls += 1;
        if (value === 6) LUDO.State.stats.sixes += 1;
      }
      return value;
    },

    reset() { DiceModel.lastValue = null; DiceModel.rollCount = 0; }
  };

  LUDO.DiceModel = DiceModel;
})();
