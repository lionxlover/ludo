/* ============================================================
 * Ludo Master - ai/aiEvaluator.js
 * Heuristic scoring of candidate moves. Pure logic shared by
 * all bot difficulties.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  /** How many enemy tokens could hit cell abs within one dice roll? */
  function threatAt(game, color, abs) {
    if (abs == null || LUDO.SafeCells.isSafe(abs)) return 0;
    let threats = 0;
    game.players.forEach((p) => {
      if (p.color === color) return;
      p.tokens.forEach((t) => {
        if (t.progress >= 1 && t.progress <= 51) {
          const e = LUDO.PathBuilder.absFor(t.color, t.progress);
          const d = (((abs - e) % 52) + 52) % 52;
          if (d >= 1 && d <= 6) threats += 1;
        }
      });
    });
    return threats;
  }

  /** Heuristic value of one candidate move. */
  function scoreMove(game, player, move) {
    const rules = game.rules;
    let s = 0;
    const token = move.token;

    if (move.type === 'spawn') {
      s += 260;
      if (LUDO.PlayerModel.activeCount(player) < 2) s += 150;   // get bodies out
    } else {
      s += (move.to - move.from) * 6;
    }

    if (move.captures && move.captures.length) {
      s += 900;
      move.captures.forEach((ct) => { s += 6 * ct.progress; }); // richer victims matter
    }

    if (move.finishes) s += 1400;
    else if (move.entersHome) s += 420;
    else if (move.to >= 52) s += (move.to - 51) * 10;

    /* Landing safety on the shared track. */
    if (move.to <= 51) {
      const abs = LUDO.PathBuilder.absFor(player.color, move.to);
      if (LUDO.SafeCells.isSafe(abs)) s += 140;
      if (!(move.captures && move.captures.length)) {
        const threats = threatAt(game, player.color, abs);
        s -= threats * (180 + (move.to / 57) * 220);
      }
      if (rules.blockades) {
        const counts = LUDO.BlockadeRules.countsByColor(game, abs);
        if ((counts[player.color] || 0) >= 1) s += 220;   // forms a blockade
      }
    }

    /* Escaping a threatened origin is good; breaking own blockade is not. */
    if (move.from >= 1 && move.from <= 51) {
      const fromAbs = LUDO.PathBuilder.absFor(player.color, move.from);
      s += threatAt(game, player.color, fromAbs) * 150;
      if (rules.blockades && LUDO.BlockadeRules.ownBlockadeAt(game, player.color, fromAbs)) {
        s -= 120;
      }
    }

    return s;
  }

  /** Static value of a player's whole position (for 1-ply sims). */
  function boardScore(game, player) {
    let s = 0;
    player.tokens.forEach((t) => {
      if (t.progress === 0) { s -= 8; return; }
      s += t.progress * 2;
      if (t.progress <= 51) {
        const abs = LUDO.PathBuilder.absFor(player.color, t.progress);
        s += LUDO.SafeCells.isSafe(abs) ? 40 : -threatAt(game, player.color, abs) * 30;
      } else {
        s += 60;   // safely in the home stretch
      }
    });
    return s;
  }

  LUDO.AIEvaluator = { scoreMove, boardScore, threatAt };
})();
