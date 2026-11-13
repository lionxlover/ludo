/* ============================================================
 * Ludo Master - ai/aiNormal.js
 * Normal bot: greedy one-ply choice with light random noise.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  function choose(game, player, dice, moves) {
    if (!moves || !moves.length) return null;

    let best = null;
    let bestScore = -Infinity;
    moves.forEach((m) => {
      const s = LUDO.AIEvaluator.scoreMove(game, player, m) + Math.random() * 90;
      if (s > bestScore) { bestScore = s; best = m; }
    });
    return best;
  }

  LUDO.AINormal = { choose };
})();
