/* ============================================================
 * Ludo Master - rules/moveValidator.js
 * Decides whether a given token may move with a dice value.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const MoveValidator = {
    /**
     * Validate one token move. Returns a move descriptor or null:
     * {token, from, to, type:'spawn'|'move', captures[], finishes, entersHome}
     */
    validate(game, player, token, dice) {
      const rules = game.rules;

      if (token.progress === 0) {
        /* Spawn attempt from base. */
        if (!LUDO.SpawnRules.canSpawn(dice, rules)) return null;
        if (LUDO.SpawnRules.spawnBlocked(game, player.color)) return null;
        return {
          token, from: 0, to: 1, type: 'spawn',
          captures: [], finishes: false, entersHome: false
        };
      }

      if (token.progress >= LUDO.CONST.PATH_LEN) return null;   // already finished

      const to = LUDO.FinishRules.target(token.progress, dice, rules);
      if (to == null) return null;

      /* Enemy blockades anywhere along the way (incl. landing cell)? */
      if (LUDO.BlockadeRules.pathBlocked(game, player.color, token.progress, to)) return null;

      const entersHome = token.progress <= 51 && to >= 52;
      const finishes = to === LUDO.CONST.PATH_LEN;
      const captures = finishes ? [] : LUDO.CaptureRules.getCaptures(
        game, player.color, LUDO.PathBuilder.absFor(player.color, to)
      );

      return {
        token, from: token.progress, to, type: 'move',
        captures, finishes, entersHome
      };
    },

    /** All legal moves for a player with this dice value. */
    legalMoves(game, player, dice) {
      const moves = [];
      player.tokens.forEach((t) => {
        const m = MoveValidator.validate(game, player, t, dice);
        if (m) moves.push(m);
      });
      return moves;
    },

    /** Convenience: does this player have any legal move at all? */
    hasAny(game, player, dice) {
      return MoveValidator.legalMoves(game, player, dice).length > 0;
    }
  };

  LUDO.MoveValidator = MoveValidator;
})();
