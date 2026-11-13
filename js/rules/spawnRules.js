/* ============================================================
 * Ludo Master - rules/spawnRules.js
 * Conditions for bringing a token out of its base onto the
 * start cell.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  LUDO.SpawnRules = {
    /** Can a token leave the base with this dice value? */
    canSpawn(dice, rules) {
      if (!rules) rules = LUDO.State.rules;
      return rules.spawnOnSixOnly ? dice === 6 : (dice === 6 || dice === 1);
    },

    /** Progress value a spawned token lands on (= its start cell). */
    spawnProgress() { return 1; },

    /** Spawn is blocked when an enemy blockade sits on the start cell. */
    spawnBlocked(game, color) {
      if (!game.rules.blockades) return false;
      const abs = LUDO.PathBuilder.startAbs(color);
      return LUDO.BlockadeRules.enemyBlockadeAt(game, color, abs);
    }
  };
})();
