/* ============================================================
 * Ludo Master - core/constants.js
 * Global constants shared by every module.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  LUDO.CONST = {
    VERSION: '1.0.0',
    GAME_NAME: 'Ludo Master',

    /* Seat order is clockwise: red (top-left), green (top-right),
     * yellow (bottom-right), blue (bottom-left). */
    COLORS: ['red', 'green', 'yellow', 'blue'],

    COLOR_HEX: {
      red: '#e53935',
      green: '#43a047',
      yellow: '#f4b400',
      blue: '#1e88e5'
    },

    TOKENS_PER_PLAYER: 4,
    TRACK_LEN: 52,   // shared circular track cells
    PATH_LEN: 57,    // 1..51 shared track, 52..56 home column, 57 = centre

    PHASE: {
      IDLE: 'idle',
      ROLLING: 'rolling',
      CHOOSING: 'choosing',
      MOVING: 'moving',
      OVER: 'over'
    },

    SPEED_MS: { slow: 300, normal: 180, fast: 110 },  // token step duration
    DICE_MS: 640,                                     // dice shake duration
    AI_MS: { slow: 1300, normal: 750, fast: 380 },    // bot thinking delay

    KEYS: {
      SETTINGS: 'ludo_settings_v1',
      STATS: 'ludo_stats_v1',
      SAVE: 'ludo_save_v1'
    },

    TEAMS: { A: ['red', 'yellow'], B: ['green', 'blue'] }
  };
})();
