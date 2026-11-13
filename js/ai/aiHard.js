/* ============================================================
 * Ludo Master - ai/aiHard.js
 * Hard bot: heuristic scoring plus a 1-ply simulation of the
 * best candidates on a cloned game (material + safety swing).
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  function simulate(game, player, move) {
    const clone = LUDO.Utils.deepClone(game);
    const clonePlayer = clone.players.find((p) => p.color === player.color);
    const cloneToken = clonePlayer.tokens.find((t) => t.id === move.token.id);
    const cloneMove = Object.assign({}, move, { token: cloneToken });
    LUDO.RulesEngine.applyMove(clone, cloneMove);
    return clone;
  }

  function choose(game, player, dice, moves) {
    if (!moves || !moves.length) return null;

    /* Rank candidates heuristically, keep the top three. */
    const ranked = moves
      .map((m) => ({ m, s: LUDO.AIEvaluator.scoreMove(game, player, m) }))
      .sort((a, b) => b.s - a.s);
    const shortlist = ranked.slice(0, 3);

    let best = shortlist[0].m;
    let bestScore = -Infinity;

    shortlist.forEach(({ m, s }) => {
      let total = s;
      if (!m.finishes) {
        try {
          const clone = simulate(game, player, m);
          const me = clone.players.find((p) => p.color === player.color);
          const gain = LUDO.AIEvaluator.boardScore(clone, me) -
                       LUDO.AIEvaluator.boardScore(game, player);
          total += gain * 0.6;
        } catch (e) { /* simulation is best-effort only */ }
      }
      if (total > bestScore) { bestScore = total; best = m; }
    });

    return best;
  }

  LUDO.AIHard = { choose, simulate };
})();
