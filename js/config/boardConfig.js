/* ============================================================
 * Ludo Master - config/boardConfig.js
 * Static geometry of the classic 15x15 Ludo board.
 * Rows/columns are 0-based; (r7,c7) is the exact board centre.
 *
 * Seat layout (clockwise):
 *   red    top-left     rows 0-5,  cols 0-5
 *   green  top-right    rows 0-5,  cols 9-14
 *   yellow bottom-right rows 9-14, cols 9-14
 *   blue   bottom-left  rows 9-14, cols 0-5
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  LUDO.BoardConfig = {
    SIZE: 15,
    ORDER: LUDO.CONST.COLORS.slice(),   // ['red','green','yellow','blue']

    /* Top-left corner of each 6x6 base yard. */
    BASE_RECT: {
      red:    { row: 0, col: 0 },
      green:  { row: 0, col: 9 },
      yellow: { row: 9, col: 9 },
      blue:   { row: 9, col: 0 }
    },

    /* Index of each colour's start cell on the shared 52-cell track. */
    START: { red: 1, green: 14, yellow: 27, blue: 40 },

    /* Shared-track cell a colour passes just before entering its
     * home column (the "entry" or pre-home cell). */
    ENTRY: {
      red:    { r: 7,  c: 0 },
      green:  { r: 0,  c: 7 },
      yellow: { r: 7,  c: 14 },
      blue:   { r: 14, c: 7 }
    },

    /* The 5 home-column cells per colour, in walking order
     * (progress 52..56). */
    HOME_COL: {
      red:    [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }],
      green:  [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }],
      yellow: [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }],
      blue:   [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }]
    },

    /* Resting slots inside each base yard, in continuous cell units
     * (cell centres sit at i + 0.5). */
    BASE_SLOTS: {
      red:    [{ x: 1.75, y: 1.75 }, { x: 4.25, y: 1.75 }, { x: 1.75, y: 4.25 }, { x: 4.25, y: 4.25 }],
      green:  [{ x: 10.75, y: 1.75 }, { x: 13.25, y: 1.75 }, { x: 10.75, y: 4.25 }, { x: 13.25, y: 4.25 }],
      yellow: [{ x: 10.75, y: 10.75 }, { x: 13.25, y: 10.75 }, { x: 10.75, y: 13.25 }, { x: 13.25, y: 13.25 }],
      blue:   [{ x: 1.75, y: 10.75 }, { x: 4.25, y: 10.75 }, { x: 1.75, y: 13.25 }, { x: 4.25, y: 13.25 }]
    },

    /* Where finished tokens rest inside the centre, per colour. */
    FINISH_SPOT: {
      red:    { x: 6.65, y: 7.5 },
      green:  { x: 7.5,  y: 6.65 },
      yellow: { x: 8.35, y: 7.5 },
      blue:   { x: 7.5,  y: 8.35 }
    },

    CENTRE: { x: 7.5, y: 7.5 },

    LABEL: { red: 'Red', green: 'Green', yellow: 'Yellow', blue: 'Blue' }
  };
})();
