/* ============================================================
 * Ludo Master - game/ranking.js
 * Finish order bookkeeping and final standings.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const Ranking = {
    /** Record a player crossing the finish line (first time only). */
    recordPlayer(game, player) {
      if (player.rank != null) return player.rank;
      const rank = game.ranks.length + 1;
      player.rank = rank;
      game.ranks.push(player);
      return rank;
    },

    /** Record a completed team; both members share the rank. */
    recordTeam(game, team) {
      if (game.teamRanks.indexOf(team) >= 0) return game.teamRanks.length;
      game.teamRanks.push(team);
      const rank = game.teamRanks.length;
      LUDO.PlayerModel.teamMembers(game, team).forEach((p) => { p.rank = rank; });
      return rank;
    },

    /**
     * Ordered standings for the win screen:
     * finished players by rank first, then the rest by progress.
     */
    standings(game) {
      const finished = game.ranks.slice().sort((a, b) => a.rank - b.rank);
      const rest = game.players
        .filter((p) => p.rank == null)
        .sort((a, b) => LUDO.FinishRules.score(b) - LUDO.FinishRules.score(a));
      return finished.concat(rest);
    },

    winnerName(game) {
      if (game.teams) {
        const team = game.winnerTeam || (game.teamRanks[0] || 'A');
        const members = LUDO.PlayerModel.teamMembers(game, team);
        return members.map((m) => m.name).join(' & ');
      }
      const w = game.winner || game.ranks[0];
      return w ? w.name : '';
    },

    isHumanWinner(game) {
      if (game.teams) {
        const team = game.winnerTeam;
        return LUDO.PlayerModel.teamMembers(game, team || 'A').some((m) => m.type === 'human');
      }
      return game.winner && game.winner.type === 'human';
    }
  };

  LUDO.Ranking = Ranking;
})();
