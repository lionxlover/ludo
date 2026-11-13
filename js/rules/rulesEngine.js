/* ============================================================
 * Ludo Master - rules/rulesEngine.js
 * Core rules API: list legal moves and apply one to the game
 * object. Pure logic - no DOM access, so the AI harness can run
 * full games headlessly.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const RulesEngine = {
    /** Legal move list for the current player. */
    getLegalMoves(game, player, dice) {
      return LUDO.MoveValidator.legalMoves(game, player, dice);
    },

    /**
     * Apply a move (mutates the game). Returns:
     * {captured, finishedToken, from, to, move}
     */
    applyMove(game, move) {
      const token = move.token;
      const from = token.progress;
      token.progress = move.to;

      let captured = [];
      if (move.captures && move.captures.length) {
        captured = LUDO.CaptureRules.applyCaptures(game, move.captures);
        const mover = game.players.find((p) => p.color === token.color);
        if (mover) mover.captures += captured.length;
      }

      const finishedToken = move.to === LUDO.CONST.PATH_LEN;

      /* Running log entry inside the game object (for saves/AI). */
      game.lastMove = {
        color: token.color,
        tokenId: token.id,
        from, to: move.to,
        dice: move.dice != null ? move.dice : null,
        spawn: move.type === 'spawn',
        capturedIds: captured.map((t) => t.id),
        finishedToken
      };

      return { captured, finishedToken, from, to: move.to, move };
    },

    /** Value of a token for ranking ties (AI/standings helper). */
    tokenValue(t) { return t.progress; }
  };

  LUDO.RulesEngine = RulesEngine;
})();
