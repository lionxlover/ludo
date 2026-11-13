/* ============================================================
 * Ludo Master - config/safeCells.js
 * The 8 protected track cells: the four coloured start cells and
 * the four star cells (8 steps ahead of each start). Tokens on
 * these cells can never be captured.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const STARTS = [1, 14, 27, 40];          // track indices of start cells
  const STARS = [9, 22, 35, 48];           // track indices of star cells
  const ALL = STARTS.concat(STARS);

  const START_SET = {};
  const STAR_SET = {};
  const ALL_SET = {};
  STARTS.forEach((i) => { START_SET[i] = true; ALL_SET[i] = true; });
  STARS.forEach((i) => { STAR_SET[i] = true; ALL_SET[i] = true; });

  LUDO.SafeCells = {
    STARTS, STARS, ALL,
    isSafe(abs) { return ALL_SET[abs] === true; },
    isStart(abs) { return START_SET[abs] === true; },
    isStar(abs) { return STAR_SET[abs] === true; }
  };
})();
