/* ============================================================
 * Ludo Master - game/historyLogger.js
 * Move log panel fed by game events (rolls, captures, finishes).
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const HistoryLogger = {
    listEl: null,
    MAX: 60,

    /** Verb agreement helper: "You have" vs "Bot Nova has". */
    verb(name, plural, singular) {
      return name === 'You' ? plural : singular;
    },

    init() {
      HistoryLogger.listEl = LUDO.Utils.qs('#log-list');
      if (!HistoryLogger.listEl) return;

      LUDO.Bus.on('game:start', () => {
        HistoryLogger.clear();
        HistoryLogger.add({ color: null, text: 'New game started' });
      });

      LUDO.Bus.on('dice:rolled', ({ player, value }) => {
        HistoryLogger.add({ color: player.color, text: player.name + ' rolled ' + value });
      });

      LUDO.Bus.on('three:sixes', ({ player }) => {
        HistoryLogger.add({ color: player.color, text: player.name + ': three sixes, forfeited' });
      });

      LUDO.Bus.on('token:captured', ({ mover, captured }) => {
        HistoryLogger.add({
          color: mover.color,
          text: mover.name + ' captured ' + captured.length + ' ' +
                captured[0].color + ' token' + (captured.length > 1 ? 's' : '')
        });
      });

      LUDO.Bus.on('token:finished', ({ player }) => {
        HistoryLogger.add({ color: player.color, text: player.name + ' finished a token' });
      });

      LUDO.Bus.on('player:finished', ({ player, rank }) => {
        HistoryLogger.add({ color: player.color, text: player.name + ' finished #' + rank });
      });

      LUDO.Bus.on('no:moves', ({ player }) => {
        HistoryLogger.add({
          color: player.color,
          text: player.name + ' ' + HistoryLogger.verb(player.name, 'have', 'has') + ' no move'
        });
      });

      LUDO.Bus.on('game:over', ({ game }) => {
        HistoryLogger.add({
          color: null,
          text: 'Game over - ' + LUDO.Ranking.winnerName(game) + ' wins'
        });
      });
    },

    clear() {
      if (HistoryLogger.listEl) HistoryLogger.listEl.innerHTML = '';
    },

    add(entry) {
      const list = HistoryLogger.listEl;
      if (!list) return;
      const li = LUDO.Utils.el('li', 'log-item' + (entry.color ? ' log-' + entry.color : ''));
      const game = LUDO.State.game;
      if (game && game.turnCount > 0) {
        li.appendChild(LUDO.Utils.el('span', 'log-turn', 'T' + game.turnCount));
      }
      const dot = LUDO.Utils.el('span', 'log-dot' + (entry.color ? ' dot-' + entry.color : ''));
      li.appendChild(dot);
      li.appendChild(document.createTextNode(entry.text));
      list.insertBefore(li, list.firstChild);
      while (list.children.length > HistoryLogger.MAX) list.removeChild(list.lastChild);
    }
  };

  LUDO.HistoryLogger = HistoryLogger;
})();
