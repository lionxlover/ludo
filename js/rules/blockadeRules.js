/* ============================================================
 * Ludo Master - rules/blockadeRules.js
 * With the blockade rule on, two or more tokens of one colour on
 * the same non-safe shared cell form a blockade that opponents
 * can neither pass nor land on. Own colour is never blocked.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const BlockadeRules = {
    /** All tokens (any colour) on absolute track cell abs. */
    tokensAt(game, abs) {
      const out = [];
      game.players.forEach((p) => {
        p.tokens.forEach((t) => {
          if (t.progress >= 1 && t.progress <= 51 &&
              LUDO.PathBuilder.absFor(t.color, t.progress) === abs) {
            out.push(t);
          }
        });
      });
      return out;
    },

    /** Colour -> token count on this cell. */
    countsByColor(game, abs) {
      const counts = {};
      BlockadeRules.tokensAt(game, abs).forEach((t) => {
        counts[t.color] = (counts[t.color] || 0) + 1;
      });
      return counts;
    },

    /** Does an enemy blockade block `color` on cell abs? */
    enemyBlockadeAt(game, color, abs) {
      if (!game.rules.blockades) return false;
      if (abs == null || LUDO.SafeCells.isSafe(abs)) return false;
      const counts = BlockadeRules.countsByColor(game, abs);
      for (const c of Object.keys(counts)) {
        if (c !== color && counts[c] >= 2) return true;
      }
      return false;
    },

    /** Has `color` itself a blockade on abs? */
    ownBlockadeAt(game, color, abs) {
      if (!game.rules.blockades) return false;
      if (abs == null) return false;
      const counts = BlockadeRules.countsByColor(game, abs);
      return (counts[color] || 0) >= 2;
    },

    /**
     * Is the stretch from progress `fromP` to `toP` (exclusive of
     * start, inclusive of landing) blocked by an enemy blockade?
     * Only shared-track cells (progress <= 51) can be blocked.
     */
    pathBlocked(game, color, fromP, toP) {
      if (!game.rules.blockades) return false;
      const last = Math.min(toP, 51);
      for (let p = fromP + 1; p <= last; p++) {
        const abs = LUDO.PathBuilder.absFor(color, p);
        if (BlockadeRules.enemyBlockadeAt(game, color, abs)) return true;
      }
      return false;
    }
  };

  LUDO.BlockadeRules = BlockadeRules;
})();
