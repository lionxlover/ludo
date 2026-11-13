/* ============================================================
 * Ludo Master - config/pathBuilder.js
 * Builds the 52-cell clockwise shared track plus the 57-step
 * private path (51 track + 5 home column + centre) per colour.
 *
 * A token's "progress" p means:
 *   0        -> resting in its base
 *   1..51    -> standing on shared track cell PATH[color][p-1]
 *   52..56   -> home column
 *   57       -> finished (centre)
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const CFG = LUDO.BoardConfig;
  const mod = (n, m) => ((n % m) + m) % m;

  /* The 52 shared cells in clockwise order, starting with (6,0). */
  const TRACK = [
    { r: 6, c: 0 }, { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
    { r: 0, c: 7 },
    { r: 0, c: 8 }, { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
    { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
    { r: 7, c: 14 },
    { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
    { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
    { r: 14, c: 7 },
    { r: 14, c: 6 }, { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
    { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
    { r: 7, c: 0 }
  ];

  /* Per-colour 57-step path. Each step: {r, c, abs?, home?, centre?} */
  function buildPath(color) {
    const path = [];
    for (let p = 1; p <= 51; p++) {
      const abs = mod(CFG.START[color] + p - 1, LUDO.CONST.TRACK_LEN);
      const cell = TRACK[abs];
      path.push({ r: cell.r, c: cell.c, abs, home: false, centre: false });
    }
    CFG.HOME_COL[color].forEach((cell) => {
      path.push({ r: cell.r, c: cell.c, abs: null, home: true, centre: false });
    });
    path.push({ r: 7, c: 7, abs: null, home: false, centre: true });
    return path;
  }

  const PATH = {
    red: buildPath('red'),
    green: buildPath('green'),
    yellow: buildPath('yellow'),
    blue: buildPath('blue')
  };

  LUDO.PathBuilder = {
    TRACK,
    PATH,

    /** Absolute track index (0..51) for a colour at progress p, or null. */
    absFor(color, p) {
      if (p == null || p < 1 || p > 51) return null;
      return mod(CFG.START[color] + p - 1, LUDO.CONST.TRACK_LEN);
    },

    /** Board cell {r,c} for a colour at progress p (1..57). */
    cellFor(color, p) {
      const step = PATH[color][p - 1];
      return step ? { r: step.r, c: step.c } : null;
    },

    startAbs(color) { return CFG.START[color]; },

    entryAbs(color) {
      const e = CFG.ENTRY[color];
      for (let i = 0; i < TRACK.length; i++) {
        if (TRACK[i].r === e.r && TRACK[i].c === e.c) return i;
      }
      return -1;
    }
  };
})();
