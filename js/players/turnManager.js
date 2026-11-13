/* ============================================================
 * Ludo Master - players/turnManager.js
 * Clockwise turn rotation that skips finished players.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const TurnManager = {
    reset(game) {
      game.current = 0;
      if (game.players[0] && game.players[0].finished) TurnManager.next(game);
      return TurnManager.current(game);
    },

    current(game) {
      return game.players[game.current % game.players.length];
    },

    /** Advance to the next unfinished player. No-op when done. */
    next(game) {
      const n = game.players.length;
      for (let i = 1; i <= n; i++) {
        const idx = (game.current + i) % n;
        if (!game.players[idx].finished) { game.current = idx; return TurnManager.current(game); }
      }
      return TurnManager.current(game);   // everyone finished
    },

    /** Peek who plays after `player` (UI hint). */
    peekNext(game) {
      const n = game.players.length;
      for (let i = 1; i <= n; i++) {
        const idx = (game.current + i) % n;
        if (!game.players[idx].finished) return game.players[idx];
      }
      return null;
    },

    /** True when the same player keeps the turn (extra rolls). */
    keepTurn(game, player) {
      return TurnManager.current(game) === player;
    }
  };

  LUDO.TurnManager = TurnManager;
})();
