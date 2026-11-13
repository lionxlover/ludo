/* ============================================================
 * Ludo Master - rules/captureRules.js
 * Captures: landing on a non-safe shared cell sends every
 * opponent token there back to its base.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const CaptureRules = {
    /** Opponent tokens standing on absolute track cell abs. */
    getCaptures(game, color, abs) {
      if (abs == null || abs < 0) return [];
      if (LUDO.SafeCells.isSafe(abs)) return [];
      const captured = [];
      game.players.forEach((p) => {
        if (p.color === color) return;
        p.tokens.forEach((t) => {
          if (t.progress >= 1 && t.progress <= 51 &&
              LUDO.PathBuilder.absFor(t.color, t.progress) === abs) {
            captured.push(t);
          }
        });
      });
      return captured;
    },

    /** Send the captured tokens home (mutates the game). */
    applyCaptures(game, captured) {
      (captured || []).forEach((t) => { t.progress = 0; });
      return captured || [];
    },

    /** Would landing here capture anyone? (helper for the AI) */
    wouldCapture(game, color, abs) {
      return CaptureRules.getCaptures(game, color, abs).length > 0;
    }
  };

  LUDO.CaptureRules = CaptureRules;
})();
