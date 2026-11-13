/* ============================================================
 * Ludo Master - ai/aiEasy.js
 * Easy bot: mostly random, only opportunistically captures.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  function choose(game, player, dice, moves) {
    if (!moves || !moves.length) return null;

    const captures = moves.filter((m) => m.captures && m.captures.length);
    if (captures.length && Math.random() < 0.6) {
      return LUDO.Utils.choice(captures);
    }
    const finishing = moves.filter((m) => m.finishes);
    if (finishing.length && Math.random() < 0.5) return LUDO.Utils.choice(finishing);

    return LUDO.Utils.choice(moves);
  }

  LUDO.AIEasy = { choose };
})();
