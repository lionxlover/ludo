/* ============================================================
 * Ludo Master - players/playerFactory.js
 * Builds the player roster for a new game from a setup config.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const PlayerFactory = {
    /**
     * config.players = [{color, name, type: 'human'|'ai'|'off', aiLevel}]
     * in clockwise colour order. 'off' seats are dropped; fewer than
     * two active seats is invalid.
     */
    fromConfig(config) {
      const active = (config.players || [])
        .filter((p) => p && p.type !== 'off')
        .map((p) => LUDO.PlayerModel.create(
          p.color, p.name, p.type, p.aiLevel,
          config.teams ? LUDO.PlayerModel.teamColor(p.color) : null
        ));
      return active;
    },

    /** Rebuild players from an autosave blob (tokens keep progress). */
    fromSave(save) {
      return (save.players || []).map((p) => {
        const player = LUDO.PlayerModel.create(p.color, p.name, p.type, p.aiLevel, p.team);
        player.captures = p.captures || 0;
        player.sixes = p.sixes || 0;
        player.finished = !!p.finished;
        player.rank = p.rank != null ? p.rank : null;
        (p.tokens || []).forEach((tk, i) => {
          if (player.tokens[i]) player.tokens[i].progress = tk.progress | 0;
        });
        return player;
      });
    }
  };

  /* Team helpers live on PlayerModel; mirror them here for factory use. */
  LUDO.PlayerModel.teamColor = function (color) {
    return LUDO.CONST.TEAMS.A.indexOf(color) >= 0 ? 'A' : 'B';
  };

  LUDO.PlayerFactory = PlayerFactory;
})();
