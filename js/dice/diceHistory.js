/* ============================================================
 * Ludo Master - dice/diceHistory.js
 * A small strip showing the most recent rolls.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const DiceHistory = {
    listEl: null,
    MAX: 12,

    init() {
      DiceHistory.listEl = LUDO.Utils.qs('#dice-history');
    },

    clear() {
      if (DiceHistory.listEl) DiceHistory.listEl.innerHTML = '';
    },

    push(value, color) {
      const list = DiceHistory.listEl;
      if (!list) return;
      const item = LUDO.Utils.el('span', 'mini-dice mini-' + color, String(value));
      list.appendChild(item);
      while (list.children.length > DiceHistory.MAX) list.removeChild(list.firstChild);
    }
  };

  LUDO.DiceHistory = DiceHistory;
})();
