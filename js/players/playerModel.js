/* ============================================================
 * Ludo Master - players/playerModel.js
 * Player/token helpers. Players are plain objects (easy to
 * serialize for autosave) created by playerFactory.js.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const PlayerModel = {
    /** Create one player object with its four tokens. */
    create(color, name, type, aiLevel, team) {
      return {
        id: color,
        color,
        name: name || LUDO.BoardConfig.LABEL[color],
        type: type === 'ai' ? 'ai' : 'human',
        aiLevel: aiLevel || 'normal',
        team: team || null,
        tokens: [0, 1, 2, 3].map((i) => ({
          id: color + '-' + i,
          color,
          idx: i,
          progress: 0        // 0 base, 1..51 track, 52..56 home, 57 centre
        })),
        captures: 0,
        sixes: 0,
        finished: false,
        rank: null
      };
    },

    isAI(player) { return player && player.type === 'ai'; },

    homeCount(player) {
      return player.tokens.filter((t) => t.progress === LUDO.CONST.PATH_LEN).length;
    },

    activeCount(player) {
      /* Tokens actually out on the board (track or home column). */
      return player.tokens.filter((t) => t.progress >= 1 && t.progress < LUDO.CONST.PATH_LEN).length;
    },

    baseCount(player) {
      return player.tokens.filter((t) => t.progress === 0).length;
    },

    totalProgress(player) {
      return player.tokens.reduce((sum, t) => sum + t.progress, 0);
    },

    tokenById(player, tokenId) {
      return player.tokens.find((t) => t.id === tokenId) || null;
    },

    teamOf(game, player) {
      if (!game.teams) return null;
      return player.team;
    },

    teamMembers(game, team) {
      return game.players.filter((p) => p.team === team);
    },

    teamDone(game, team) {
      const members = PlayerModel.teamMembers(game, team);
      return members.length > 0 && members.every((p) => p.finished);
    }
  };

  LUDO.PlayerModel = PlayerModel;
})();
