/* ============================================================
 * Ludo Master - game/moveExecutor.js
 * Visual execution of an already-applied move: walking steps,
 * capture fly-backs, finish effects, toasts.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const MoveExecutor = {
    /**
     * Animate a move whose state change was already applied by
     * RulesEngine.applyMove(game, move).
     */
    async animate(move, result, game) {
      const token = move.token;
      const player = game.players.find((p) => p.color === token.color);

      if (move.type === 'spawn') {
        LUDO.Bus.emit('move:start', { move });
        await LUDO.TokenAnimator.walk(token, 0, 1, game);
        await LUDO.TokenRenderer.place(token, game);
      } else {
        await LUDO.TokenAnimator.walk(token, move.from, move.to, game);
        await LUDO.TokenRenderer.place(token, game);
      }

      /* Captures: fly the victims back home. */
      if (result.captured && result.captured.length) {
        LUDO.Bus.emit('token:captured', { mover: player, captured: result.captured });
        LUDO.Toast.show(
          LUDO.I18N.t('captured', { a: player.name, b: result.captured[0].color }),
          'warn'
        );
        await LUDO.TokenAnimator.sendToBase(result.captured, game);
        result.captured.forEach((t) => LUDO.TokenRenderer.place(t, game));
      }

      if (result.finishedToken) {
        LUDO.Bus.emit('token:finished', { player, token });
        LUDO.Toast.show(LUDO.I18N.t('finishedToken', { c: player.name }), 'success');
      }

      /* Sync every token with the authoritative state. Placing all of them
       * (not just the mover) re-centres a token that was part of a stack the
       * mover just left, and resizes the stack it joined. */
      LUDO.TokenRenderer.placeAll(game);
      LUDO.Bus.emit('move:end', { move, result });
      return result;
    }
  };

  LUDO.MoveExecutor = MoveExecutor;
})();
