/* ============================================================
 * Ludo Master - ai/aiEngine.js
 * Facade that dispatches to the chosen bot difficulty and
 * exposes the thinking-delay used by the game controller.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const AIEngine = {
    /**
     * Pick a move for an AI player.
     * moves = RulesEngine.getLegalMoves(game, player, dice)
     */
    choose(game, player, dice, moves) {
      if (!moves || !moves.length) return null;
      switch (player.aiLevel) {
        case 'easy': return LUDO.AIEasy.choose(game, player, dice, moves);
        case 'hard': return LUDO.AIHard.choose(game, player, dice, moves);
        case 'normal':
        default: return LUDO.AINormal.choose(game, player, dice, moves);
      }
    },

    /** Thinking delay (ms) honouring the AI speed setting. */
    delayFor() {
      const speed = (LUDO.State.settings && LUDO.State.settings.aiSpeed) || 'normal';
      const base = LUDO.CONST.AI_MS[speed] != null ? LUDO.CONST.AI_MS[speed] : 750;
      return base + LUDO.Utils.randInt(-120, 220);
    }
  };

  LUDO.AIEngine = AIEngine;
})();
