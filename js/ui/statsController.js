/* ============================================================
 * Ludo Master - ui/statsController.js
 * Lifetime statistics persisted in localStorage + stats modal.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const StatsController = {
    init() {
      LUDO.Utils.qsa('[data-open="modal-stats"]').forEach((b) => {
        b.addEventListener('click', () => {
          StatsController.render();
          LUDO.ModalManager.open('modal-stats');
        });
      });
    },

    /** Fold a finished game into the lifetime stats. */
    recordResult(game) {
      const stats = LUDO.State.stats;
      stats.games += 1;
      stats.captures += game.players.reduce((s, p) => s + p.captures, 0);
      stats.tokensHome += game.players.reduce((s, p) => s + LUDO.FinishRules.homeCount(p), 0);
      if (stats.bestTurns == null || game.turnCount < stats.bestTurns) {
        stats.bestTurns = game.turnCount;
      }
      const name = LUDO.Ranking.winnerName(game) || 'Unknown';
      stats.wins[name] = (stats.wins[name] || 0) + 1;
      LUDO.State.saveStats();
      if (LUDO.MenuController) LUDO.MenuController.refreshQuickStats();
    },

    render() {
      const stats = LUDO.State.stats;
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(val);
      };
      set('stat-games', stats.games);
      set('stat-rolls', stats.rolls);
      set('stat-sixes', stats.sixes);
      set('stat-captures', stats.captures);
      set('stat-tokens', stats.tokensHome);
      set('stat-best', stats.bestTurns == null ? '—' : stats.bestTurns);

      const table = LUDO.Utils.qs('#stat-wins');
      if (table) {
        table.innerHTML = '';
        const names = Object.keys(stats.wins).sort((a, b) => stats.wins[b] - stats.wins[a]);
        if (!names.length) {
          const row = LUDO.Utils.el('tr');
          const cell = LUDO.Utils.el('td', 'muted', 'No games recorded yet');
          cell.colSpan = 2;
          row.appendChild(cell);
          table.appendChild(row);
        } else {
          names.slice(0, 8).forEach((n) => {
            const row = LUDO.Utils.el('tr');
            row.appendChild(LUDO.Utils.el('td', null, n));
            row.appendChild(LUDO.Utils.el('td', null, String(stats.wins[n])));
            table.appendChild(row);
          });
        }
      }
    }
  };

  LUDO.StatsController = StatsController;
})();
