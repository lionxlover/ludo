/* ============================================================
 * Ludo Master - board/highlightManager.js
 * Highlights movable tokens and destination cells after a roll;
 * clicking a highlight triggers the corresponding move.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const HighlightManager = {
    active: [],

    /** Show all legal moves; cell/token clicks choose one. */
    showMoves(moves) {
      HighlightManager.clear();
      if (!moves || !moves.length) return;
      if (!LUDO.State.settings.showHighlights) return;

      const game = LUDO.State.game;
      if (!game) return;

      moves.forEach((move, i) => {
        let target = null;
        if (move.to <= 51) {
          target = LUDO.CellManager.cellEl(LUDO.PathBuilder.absFor(move.token.color, move.to));
        } else if (move.to < LUDO.CONST.PATH_LEN) {
          target = LUDO.CellManager.homeEl(move.token.color, move.to - 52);
        } else {
          target = LUDO.CellManager.centerEl;
        }
        if (target) {
          const fn = (ev) => {
            ev.stopPropagation();
            LUDO.GameController.chooseMove(move);
          };
          target.addEventListener('click', fn);
          HighlightManager.active.push({ el: target, fn });
          LUDO.CellManager.markDest(target, i);
        }
      });

      LUDO.TokenRenderer.setMovable(moves.map((m) => m.token.id));
    },

    clear() {
      LUDO.CellManager.clearDests();
      HighlightManager.active.forEach(({ el, fn }) => el.removeEventListener('click', fn));
      HighlightManager.active = [];
      LUDO.TokenRenderer.clearMovable();
    }
  };

  LUDO.HighlightManager = HighlightManager;
})();
