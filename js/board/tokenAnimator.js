/* ============================================================
 * Ludo Master - board/tokenAnimator.js
 * Step-by-step movement and capture fly-back animations.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const TokenAnimator = {
    stepMs() {
      const speed = (LUDO.State.settings && LUDO.State.settings.animSpeed) || 'normal';
      return LUDO.CONST.SPEED_MS[speed] != null ? LUDO.CONST.SPEED_MS[speed] : 180;
    },

    /** Walk a token visually from `from` to `to` along its path. */
    async walk(token, from, to, game) {
      const el = LUDO.TokenRenderer.element(token.id);
      if (!el) return;

      if (from === 0) {
        /* Spawning: single hop from base onto the start cell. */
        await TokenAnimator.hopToProgress(token, 1, game);
        return;
      }

      el.style.setProperty('--step', TokenAnimator.stepMs() + 'ms');
      el.classList.add('walking');
      const prevZ = el.style.zIndex;
      el.style.zIndex = '200';

      for (let p = from + 1; p <= to; p++) {
        let x, y;
        if (p >= LUDO.CONST.PATH_LEN) {
          const spot = LUDO.BoardConfig.FINISH_SPOT[token.color];
          x = spot.x; y = spot.y;
        } else {
          const cell = LUDO.PathBuilder.cellFor(token.color, p);
          x = cell.c + 0.5; y = cell.r + 0.5;
        }
        const pct = LUDO.PositionResolver.pct({ x, y });
        LUDO.TokenRenderer.setPosition(token.id, pct.leftPct, pct.topPct, 200);
        LUDO.Bus.emit('move:step', { token, progress: p });
        await LUDO.Utils.sleep(TokenAnimator.stepMs());
      }

      el.classList.remove('walking');
      el.style.zIndex = prevZ;
    },

    /** One-hop animation to a path progress (spawn). */
    async hopToProgress(token, p, game) {
      const cell = LUDO.PathBuilder.cellFor(token.color, p);
      const pct = LUDO.PositionResolver.pct({ x: cell.c + 0.5, y: cell.r + 0.5 });
      const hopEl = LUDO.TokenRenderer.element(token.id);
      if (hopEl) hopEl.style.setProperty('--step', (TokenAnimator.stepMs() + 60) + 'ms');
      LUDO.TokenRenderer.setPosition(token.id, pct.leftPct, pct.topPct, 200);
      LUDO.Bus.emit('move:step', { token, progress: p });
      await LUDO.Utils.sleep(TokenAnimator.stepMs() + 80);
    },

    /** Send captured tokens back to their base slots. */
    async sendToBase(tokens, game) {
      for (const token of tokens) {
        const el = LUDO.TokenRenderer.element(token.id);
        if (el) {
          el.classList.add('captured');
          setTimeout(() => el.classList.remove('captured'), 500);
        }
        const slot = LUDO.BoardConfig.BASE_SLOTS[token.color][token.idx];
        const pct = LUDO.PositionResolver.pct(slot);
        LUDO.TokenRenderer.setPosition(token.id, pct.leftPct, pct.topPct, 30);
        LUDO.Bus.emit('token:sent-home', { token });
        await LUDO.Utils.sleep(90);
      }
      await LUDO.Utils.sleep(260);
    }
  };

  LUDO.TokenAnimator = TokenAnimator;
})();
