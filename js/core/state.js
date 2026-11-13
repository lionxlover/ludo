/* ============================================================
 * Ludo Master - core/state.js
 * Central application state: settings, rule toggles, lifetime
 * stats and the live game object. Persists via LUDO.Store.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  function defaultRules() {
    return {
      spawnOnSixOnly: true,      // a 6 is required to leave the base
      extraTurnOnSix: true,      // rolling a 6 grants another roll
      extraTurnOnCapture: true,  // capturing grants another roll
      extraTurnOnHome: true,     // finishing a token grants another roll
      blockades: true,           // same-colour pairs block opponents
      exactFinish: true,         // the centre must be hit exactly
      threeSixForfeit: true      // three 6s in a row forfeits the turn
    };
  }

  function defaultSettings() {
    return {
      sound: true,
      volume: 0.7,
      theme: null,          // null = follow the device's light/dark setting
      animSpeed: 'normal',   // slow | normal | fast
      aiSpeed: 'normal',
      autoMoveSingle: true,  // auto-play when only one move is legal
      showHighlights: true
    };
  }

  function defaultStats() {
    return {
      games: 0,
      rolls: 0,
      sixes: 0,
      captures: 0,
      tokensHome: 0,
      bestTurns: null,
      wins: {}   // winner name -> win count
    };
  }

  const State = {
    game: null,
    paused: false,

    settings: defaultSettings(),
    rules: defaultRules(),   // defaults offered by the setup screen
    stats: defaultStats(),

    loadSettings() {
      const saved = LUDO.Store.get(LUDO.CONST.KEYS.SETTINGS, null);
      if (saved) {
        this.settings = Object.assign(defaultSettings(), saved.settings || {});
        this.rules = Object.assign(defaultRules(), saved.rules || {});
      }
      return this.settings;
    },

    saveSettings() {
      LUDO.Store.set(LUDO.CONST.KEYS.SETTINGS, { settings: this.settings, rules: this.rules });
    },

    loadStats() {
      this.stats = Object.assign(defaultStats(), LUDO.Store.get(LUDO.CONST.KEYS.STATS, {}) || {});
      return this.stats;
    },

    saveStats() { LUDO.Store.set(LUDO.CONST.KEYS.STATS, this.stats); },

    resetStats() { this.stats = defaultStats(); this.saveStats(); }
  };

  LUDO.State = State;
})();
