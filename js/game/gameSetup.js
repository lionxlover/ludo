/* ============================================================
 * Ludo Master - game/gameSetup.js
 * Builds and validates game objects from setup configs, and
 * (de)serializes autosaves. Pure logic - the menu feeds it a
 * plain config object.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const GameSetup = {
    /** Config for Quick Play: you (Red) vs three Normal bots. */
    quickConfig() {
      return {
        players: [
          { color: 'red', name: 'You', type: 'human', aiLevel: 'normal' },
          { color: 'green', name: 'Bot Nova', type: 'ai', aiLevel: 'normal' },
          { color: 'yellow', name: 'Bot Orbit', type: 'ai', aiLevel: 'normal' },
          { color: 'blue', name: 'Bot Pixel', type: 'ai', aiLevel: 'normal' }
        ],
        teams: false,
        rules: Object.assign({}, LUDO.State.rules),
        spectate: false
      };
    },

    /** Config for Watch AI vs AI (four bots, auto-rematch). */
    watchConfig() {
      const cfg = GameSetup.quickConfig();
      cfg.players = [
        { color: 'red', name: 'Bot Nova', type: 'ai', aiLevel: 'hard' },
        { color: 'green', name: 'Bot Orbit', type: 'ai', aiLevel: 'normal' },
        { color: 'yellow', name: 'Bot Pixel', type: 'ai', aiLevel: 'normal' },
        { color: 'blue', name: 'Bot Comet', type: 'ai', aiLevel: 'easy' }
      ];
      cfg.spectate = true;
      return cfg;
    },

    /** Returns an error string, or null when the config is playable. */
    validate(config) {
      const active = (config.players || []).filter((p) => p.type !== 'off');
      if (active.length < 2) return 'At least two players are needed.';
      if (config.teams && active.length !== 4) {
        return 'Team mode needs all four seats filled.';
      }
      if (config.teams && active.some((p) => p.type !== 'human' && p.type !== 'ai')) {
        return 'Team mode seats must be Human or Bot.';
      }
      return null;
    },

    /** Build the live game object. */
    build(config) {
      const err = GameSetup.validate(config);
      if (err) throw new Error(err);

      const players = LUDO.PlayerFactory.fromConfig(config);
      const game = {
        id: LUDO.Utils.uid(),
        createdAt: Date.now(),
        turnCount: 0,
        phase: LUDO.CONST.PHASE.IDLE,
        current: 0,
        players,
        teams: !!config.teams,
        rules: Object.assign({}, config.rules || LUDO.State.rules),
        consecutiveSixes: 0,
        lastRoll: null,
        lastMove: null,
        over: false,
        winner: null,
        winnerTeam: null,
        ranks: [],
        teamRanks: [],
        spectate: !!config.spectate
      };
      game.rematchConfig = GameSetup.rematchOf(config);
      return game;
    },

    rematchOf(config) {
      return {
        players: (config.players || []).map((p) => ({
          color: p.color, name: p.name, type: p.type, aiLevel: p.aiLevel
        })),
        teams: !!config.teams,
        rules: Object.assign({}, config.rules),
        spectate: !!config.spectate
      };
    },

    /** Serialize a running game for autosave. */
    serialize(game) {
      return {
        v: 1,
        players: game.players.map((p) => ({
          color: p.color, name: p.name, type: p.type, aiLevel: p.aiLevel, team: p.team,
          captures: p.captures, sixes: p.sixes,
          finished: p.finished, rank: p.rank,
          tokens: p.tokens.map((t) => ({ idx: t.idx, progress: t.progress }))
        })),
        current: game.current,
        teams: game.teams,
        rules: game.rules,
        consecutiveSixes: game.consecutiveSixes,
        turnCount: game.turnCount,
        spectate: game.spectate
      };
    },

    /** Rebuild a game from an autosave blob. */
    fromSave(save) {
      if (!save || !save.players) return null;
      const players = LUDO.PlayerFactory.fromSave(save);
      if (players.length < 2) return null;
      const game = {
        id: LUDO.Utils.uid(),
        createdAt: Date.now(),
        turnCount: save.turnCount || 0,
        phase: LUDO.CONST.PHASE.IDLE,
        current: save.current % players.length,
        players,
        teams: !!save.teams,
        rules: Object.assign({}, save.rules || LUDO.State.rules),
        consecutiveSixes: save.consecutiveSixes || 0,
        lastRoll: null,
        lastMove: null,
        over: false,
        winner: null,
        winnerTeam: null,
        ranks: [],
        teamRanks: [],
        spectate: !!save.spectate
      };
      game.rematchConfig = {
        players: players.map((p) => ({
          color: p.color, name: p.name, type: p.type, aiLevel: p.aiLevel
        })),
        teams: game.teams,
        rules: game.rules,
        spectate: game.spectate
      };
      return game;
    }
  };

  LUDO.GameSetup = GameSetup;
})();
