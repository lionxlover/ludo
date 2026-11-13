/* ============================================================
 * Ludo Master - game/gameController.js
 * The conductor: turn flow, dice rolls, move selection, extra
 * turns, three-six forfeit, autosave and game-over handling.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const GameController = {
    /** Start a fresh game from a setup config. */
    start(config) {
      const game = LUDO.GameSetup.build(config);
      LUDO.State.game = game;
      LUDO.State.paused = false;
      LUDO.ScreenManager.show('game');
      LUDO.BoardRenderer.render(game);
      LUDO.PlayerRenderer.renderAll(game);
      LUDO.TokenRenderer.spawnAll(game);
      LUDO.DiceHistory.clear();
      LUDO.TurnManager.reset(game);
      LUDO.GameScreenController.onGameStart(game);
      LUDO.Bus.emit('game:start', { game });
      GameController.save();
      GameController.beginTurn();
      if (game.spectate) LUDO.AutoPlay.arm(game);
      LUDO.Log.info('Game started', { players: game.players.length, teams: game.teams });
    },

    /** Continue a previously saved game. */
    startFromSave() {
      const save = LUDO.Store.get(LUDO.CONST.KEYS.SAVE, null);
      if (!save) return;
      const game = LUDO.GameSetup.fromSave(save);
      if (!game) { LUDO.Store.remove(LUDO.CONST.KEYS.SAVE); return; }
      LUDO.State.game = game;
      LUDO.State.paused = false;
      LUDO.ScreenManager.show('game');
      LUDO.BoardRenderer.render(game);
      LUDO.PlayerRenderer.renderAll(game);
      LUDO.TokenRenderer.spawnAll(game);
      LUDO.DiceHistory.clear();
      LUDO.GameScreenController.onGameStart(game);
      LUDO.Bus.emit('game:start', { game });
      if (game.spectate) LUDO.AutoPlay.arm(game);
      GameController.beginTurn();
    },

    save() {
      const game = LUDO.State.game;
      if (!game || game.over) return;
      LUDO.Store.set(LUDO.CONST.KEYS.SAVE, LUDO.GameSetup.serialize(game));
    },

    /** Open a turn: reset phase, update UI, hand over to human/AI. */
    beginTurn() {
      const game = LUDO.State.game;
      if (!game || game.over) return;
      game.turnCount += 1;
      game.phase = LUDO.CONST.PHASE.IDLE;

      const player = LUDO.TurnManager.current(game);
      LUDO.PlayerRenderer.updateAll(game);
      LUDO.PlayerRenderer.setActive(player.color);    // also moves the dice next to this player
      LUDO.DiceRenderer.setColor(player.color);
      LUDO.DiceRenderer.renderIdle();
      LUDO.DiceRenderer.setStatus('');
      LUDO.GameScreenController.onTurnStart(player, game);
      GameController.save();

      if (LUDO.PlayerModel.isAI(player)) {
        LUDO.DiceController.disable();
        GameController.aiTurn(player);
      } else {
        LUDO.DiceController.enable();
      }
      LUDO.Bus.emit('turn:start', { game, player });
    },

    /** AI thinking delay, then roll. */
    async aiTurn(player) {
      await LUDO.Utils.sleep(LUDO.AIEngine.delayFor());
      if (!GameController.stillCurrent(player)) return;
      GameController.roll();
    },

    stillCurrent(player) {
      const game = LUDO.State.game;
      return !!(game && !game.over && game.players[game.current] === player);
    },

    /** Roll the dice for the current player. */
    async roll() {
      const game = LUDO.State.game;
      if (!game || game.over) return;
      if (game.phase !== LUDO.CONST.PHASE.IDLE) return;

      const player = LUDO.TurnManager.current(game);
      game.phase = LUDO.CONST.PHASE.ROLLING;
      LUDO.DiceController.disable();

      const value = LUDO.DiceModel.roll();
      if (value === 6) player.sixes += 1;
      LUDO.Bus.emit('roll:start', { player });

      await LUDO.DiceAnimator.rollTo(value, player.color);
      game.lastRoll = value;
      LUDO.DiceHistory.push(value, player.color);
      LUDO.Bus.emit('dice:rolled', { player, value });

      if (value === 6) game.consecutiveSixes += 1;
      else game.consecutiveSixes = 0;

      /* Three sixes in a row: forfeit the turn. */
      if (value === 6 && game.rules.threeSixForfeit && game.consecutiveSixes >= 3) {
        game.consecutiveSixes = 0;
        LUDO.Bus.emit('three:sixes', { player, value });
        LUDO.Toast.show(LUDO.I18N.t('threeSixes'), 'warn');
        await LUDO.Utils.sleep(650);
        return GameController.endTurn(false);
      }

      const moves = LUDO.RulesEngine.getLegalMoves(game, player, value);

      if (!moves.length) {
        LUDO.Bus.emit('no:moves', { player, value });
        LUDO.Toast.show(LUDO.I18N.t('noMoves'), 'info');
        LUDO.GameScreenController.say(LUDO.I18N.t('noMoves'));
        await LUDO.Utils.sleep(950);
        const rollAgain = value === 6 && game.rules.extraTurnOnSix;
        return GameController.endTurn(rollAgain);
      }

      game.phase = LUDO.CONST.PHASE.CHOOSING;
      game.lastMoves = moves;

      if (LUDO.PlayerModel.isAI(player)) {
        LUDO.DiceRenderer.setStatus(LUDO.I18N.t('thinking', { c: player.name }));
        await LUDO.Utils.sleep(Math.max(260, LUDO.AIEngine.delayFor() * 0.55));
        if (!GameController.stillCurrent(player)) return;
        const chosen = LUDO.AIEngine.choose(game, player, value, moves);
        return GameController.chooseMove(chosen);
      }

      if (moves.length === 1 && LUDO.State.settings.autoMoveSingle) {
        await LUDO.Utils.sleep(420);
        if (!GameController.stillCurrent(player)) return;
        return GameController.chooseMove(moves[0]);
      }

      LUDO.GameScreenController.say(LUDO.I18N.t('pickToken'));
      LUDO.HighlightManager.showMoves(moves);
    },

    /** Click on a token (human choosing, or mis-click feedback). */
    onTokenClick(tokenId) {
      const game = LUDO.State.game;
      if (!game) return;
      const player = LUDO.TurnManager.current(game);

      if (game.phase !== LUDO.CONST.PHASE.CHOOSING || !player || player.type !== 'human') {
        LUDO.TokenRenderer.shake(tokenId);
        return;
      }
      const move = (game.lastMoves || []).find((m) => m.token.id === tokenId);
      if (move) GameController.chooseMove(move);
      else LUDO.TokenRenderer.shake(tokenId);
    },

    /** Execute a chosen move (human or AI). */
    async chooseMove(move) {
      const game = LUDO.State.game;
      if (!game || !move || game.phase !== LUDO.CONST.PHASE.CHOOSING) return;

      game.phase = LUDO.CONST.PHASE.MOVING;
      LUDO.HighlightManager.clear();
      LUDO.DiceController.disable();
      LUDO.TokenRenderer.clearSelected();

      const result = LUDO.RulesEngine.applyMove(game, move);
      await LUDO.MoveExecutor.animate(move, result, game);
      LUDO.PlayerRenderer.updateAll(game);

      if (LUDO.WinDetector.check(game)) return GameController.finishGame(game);

      let extra = false;
      if (game.lastRoll === 6 && game.rules.extraTurnOnSix) extra = true;
      if (result.captured.length && game.rules.extraTurnOnCapture) extra = true;
      if (result.finishedToken && game.rules.extraTurnOnHome) extra = true;
      GameController.endTurn(extra);
    },

    endTurn(extra) {
      const game = LUDO.State.game;
      if (!game || game.over) return;
      game.phase = LUDO.CONST.PHASE.IDLE;
      if (extra) {
        LUDO.Bus.emit('extra:turn', { player: LUDO.TurnManager.current(game) });
        LUDO.Toast.show(LUDO.I18N.t('extraTurn'), 'success');
        GameController.beginTurn();
      } else {
        game.consecutiveSixes = 0;
        LUDO.TurnManager.next(game);
        GameController.beginTurn();
      }
    },

    finishGame(game) {
      LUDO.DiceController.disable();
      LUDO.HighlightManager.clear();
      LUDO.Store.remove(LUDO.CONST.KEYS.SAVE);
      LUDO.StatsController.recordResult(game);
      LUDO.AutoPlay.disarm();
      const name = LUDO.Ranking.winnerName(game);
      LUDO.GameScreenController.onGameOver(game, name);
      LUDO.Confetti.burst();
      LUDO.ModalManager.open('modal-win');
      if (game.spectate) LUDO.AutoPlay.scheduleNext();
      LUDO.Log.info('Game over', { winner: name, turns: game.turnCount });
    },

    quitToMenu() {
      LUDO.AutoPlay.disarm();
      LUDO.HighlightManager.clear();
      LUDO.PauseController.set(false);
      LUDO.State.game = null;
      LUDO.ScreenManager.show('menu');
      LUDO.MenuController.refreshResume();
    },

    rematch() {
      const game = LUDO.State.game;
      const cfg = game && game.rematchConfig;
      LUDO.ModalManager.closeAll();
      if (cfg) GameController.start(cfg);
    }
  };

  LUDO.GameController = GameController;
})();
