/* ============================================================
 * Ludo Master - game/winDetector.js
 * Called after every applied move. Marks finished players /
 * teams, assigns ranks and flags the game over.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const WinDetector = {
    /**
     * Refresh finished flags and end conditions.
     * Returns true when the game just ended (or already ended).
     */
    check(game) {
      if (!game || game.over) return !!(game && game.over);

      game.players.forEach((p) => {
        if (!p.finished && LUDO.FinishRules.playerDone(p)) {
          p.finished = true;
          const rank = LUDO.Ranking.recordPlayer(game, p);
          LUDO.Bus.emit('player:finished', { game, player: p, rank });
        }
      });

      if (game.teams) {
        ['A', 'B'].forEach((team) => {
          const members = LUDO.PlayerModel.teamMembers(game, team);
          const done = members.length > 0 && members.every((m) => m.finished);
          if (done && game.teamRanks.indexOf(team) < 0) {
            LUDO.Ranking.recordTeam(game, team);
            game.over = true;
            game.winnerTeam = team;
            game.winner = members[0];
            LUDO.Bus.emit('game:over', { game, team });
          }
        });
      } else {
        const unfinished = game.players.filter((p) => !p.finished);
        if (unfinished.length <= 1) {
          const winner = game.ranks[0] || unfinished[0] || null;
          if (winner && winner.rank == null) LUDO.Ranking.recordPlayer(game, winner);
          game.over = true;
          game.winner = winner;
          LUDO.Bus.emit('game:over', { game });
        }
      }

      if (game.over) game.phase = LUDO.CONST.PHASE.OVER;
      return game.over;
    }
  };

  LUDO.WinDetector = WinDetector;
})();
