/* ============================================================
 * Ludo Master - rules/finishRules.js
 * Home column / centre finishing rules.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const PATH_LEN = () => LUDO.CONST.PATH_LEN;

  const FinishRules = {
    /** Exact landing required on the centre (57)? */
    isExact(rules) { return !rules || rules.exactFinish !== false; },

    /**
     * Target progress for a token at `p` moving `dice` steps.
     * Returns null when the move is illegal (exact mode overshoot).
     * In relaxed mode an overshoot bounces back off the centre.
     */
    target(p, dice, rules) {
      const goal = PATH_LEN();
      const raw = p + dice;
      if (raw <= goal) return raw;
      if (FinishRules.isExact(rules)) return null;
      return goal - (raw - goal);   // bounce back
    },

    tokenDone(t) { return t.progress === PATH_LEN(); },

    playerDone(player) { return player.tokens.every((t) => FinishRules.tokenDone(t)); },

    homeCount(player) { return Player_homeCount(player); },

    /** Tokens inside the home column or centre (progress >= 52). */
    inHomeStretch(player) {
      return player.tokens.filter((t) => t.progress >= 52).length;
    },

    /** Overall race progress 0..228 (4 tokens x 57). */
    score(player) { return player.tokens.reduce((s, t) => s + t.progress, 0); }
  };

  function Player_homeCount(player) {
    return player.tokens.filter((t) => t.progress === PATH_LEN()).length;
  }

  LUDO.FinishRules = FinishRules;
})();
