/* ============================================================
 * Ludo Master - board/cellManager.js
 * Builds and indexes the 52 track cells, 20 home-column cells
 * and the centre, and manages destination highlighting.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const CellManager = {
    cellsByAbs: {},
    homeCells: {},
    centerEl: null,
    boardEl: null,
    _dests: [],

    /** Create the cell grid inside #board. */
    build(boardEl) {
      CellManager.boardEl = boardEl;
      CellManager.cellsByAbs = {};
      CellManager.homeCells = {};
      CellManager._dests = [];

      const track = LUDO.PathBuilder.TRACK;
      const starts = {};
      LUDO.CONST.COLORS.forEach((color) => { starts[LUDO.BoardConfig.START[color]] = color; });
      const entries = {};
      LUDO.CONST.COLORS.forEach((color) => {
        entries[LUDO.PathBuilder.entryAbs(color)] = color;
      });

      for (let abs = 0; abs < track.length; abs++) {
        const cell = track[abs];
        const div = LUDO.Utils.el('div', 'cell track');
        div.style.gridArea = (cell.r + 1) + ' / ' + (cell.c + 1);
        div.dataset.abs = String(abs);

        if (starts[abs]) {
          div.classList.add('start', 'start-' + starts[abs]);
          div.title = LUDO.BoardConfig.LABEL[starts[abs]] + ' start';
        } else if (LUDO.SafeCells.isStar(abs)) {
          div.classList.add('star');
          const star = LUDO.Utils.el('span', 'star-mark', '\u2605');
          div.appendChild(star);
        }
        if (entries[abs] != null) {
          div.classList.add('entry', 'entry-' + entries[abs]);
        }

        boardEl.appendChild(div);
        CellManager.cellsByAbs[abs] = div;
      }

      LUDO.CONST.COLORS.forEach((color) => {
        CellManager.homeCells[color] = [];
        LUDO.BoardConfig.HOME_COL[color].forEach((hc, i) => {
          const div = LUDO.Utils.el('div', 'cell home home-' + color);
          div.style.gridArea = (hc.r + 1) + ' / ' + (hc.c + 1);
          div.dataset.home = color + '-' + i;
          boardEl.appendChild(div);
          CellManager.homeCells[color].push(div);
        });
      });

      const center = LUDO.Utils.el('div', 'center');
      center.style.gridArea = '7 / 7 / 10 / 10';
      ['red', 'green', 'yellow', 'blue'].forEach((color) => {
        center.appendChild(LUDO.Utils.el('div', 'center-tri tri-' + color));
      });
      boardEl.appendChild(center);
      CellManager.centerEl = center;
      return CellManager;
    },

    cellEl(abs) { return CellManager.cellsByAbs[abs] || null; },
    homeEl(color, idx) {
      const list = CellManager.homeCells[color];
      return list ? list[idx] || null : null;
    },

    /** Mark an element as a legal destination. */
    markDest(el, moveIndex) {
      if (!el) return;
      el.classList.add('dest');
      el.dataset.moveIndex = String(moveIndex);
      CellManager._dests.push(el);
    },

    clearDests() {
      CellManager._dests.forEach((el) => {
        el.classList.remove('dest');
        delete el.dataset.moveIndex;
      });
      CellManager._dests = [];
    },

    clear() {
      CellManager.cellsByAbs = {};
      CellManager.homeCells = {};
      CellManager.centerEl = null;
    }
  };

  LUDO.CellManager = CellManager;
})();
