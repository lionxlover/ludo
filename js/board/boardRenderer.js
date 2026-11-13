/* ============================================================
 * Ludo Master - board/boardRenderer.js
 * Renders the full board: four base yards, cell grid (via
 * CellManager) and the floating token layer.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const BoardRenderer = {
    boardEl: null,

    el() {
      if (!BoardRenderer.boardEl) BoardRenderer.boardEl = LUDO.Utils.qs('#board');
      return BoardRenderer.boardEl;
    },

    /** (Re)build the whole board for a game. */
    render(game) {
      const board = BoardRenderer.el();
      if (!board) return;
      board.innerHTML = '';
      CellManager_clear();

      /* Base yards with decorative inner square + slots. */
      LUDO.CONST.COLORS.forEach((color) => {
        const rect = LUDO.BoardConfig.BASE_RECT[color];
        const base = LUDO.Utils.el('div', 'base base-' + color);
        base.style.gridArea =
          (rect.row + 1) + ' / ' + (rect.col + 1) + ' / ' +
          (rect.row + 7) + ' / ' + (rect.col + 7);
        const inner = LUDO.Utils.el('div', 'base-inner');
        for (let i = 0; i < 4; i++) inner.appendChild(LUDO.Utils.el('div', 'base-slot'));
        base.appendChild(inner);
        board.appendChild(base);
      });

      /* Track + home columns + centre. */
      LUDO.CellManager.build(board);

      /* Floating token layer on top. */
      const layer = LUDO.Utils.el('div', 'token-layer');
      layer.id = 'token-layer';
      board.appendChild(layer);
      LUDO.TokenRenderer.init(layer);

      return board;
    },

    clear() {
      const board = BoardRenderer.el();
      if (board) board.innerHTML = '';
      CellManager_clear();
    }
  };

  function CellManager_clear() { LUDO.CellManager.clear(); }

  LUDO.BoardRenderer = BoardRenderer;
})();
