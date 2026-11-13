/* ============================================================
 * Ludo Master - board/tokenRenderer.js
 * Creates/positions the 16 token pieces on the floating layer.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const TokenRenderer = {
    layer: null,
    els: {},

    init(layer) {
      TokenRenderer.layer = layer;
      TokenRenderer.els = {};
    },

    /** Create every token element for the game. */
    spawnAll(game) {
      if (!TokenRenderer.layer) return;
      TokenRenderer.layer.innerHTML = '';
      TokenRenderer.els = {};

      game.players.forEach((player) => {
        player.tokens.forEach((token) => {
          const el = LUDO.Utils.el('div', 'token token-' + token.color);
          el.dataset.tokenId = token.id;
          el.setAttribute('role', 'button');
          el.setAttribute('aria-label', player.name + ' token ' + (token.idx + 1));
          el.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (LUDO.GameController) LUDO.GameController.onTokenClick(token.id);
          });
          TokenRenderer.layer.appendChild(el);
          TokenRenderer.els[token.id] = el;
          TokenRenderer.place(token, game);
        });
      });
    },

    /** Sync one token element with its game position. */
    place(token, game) {
      const el = TokenRenderer.els[token.id];
      if (!el) return;
      const pos = LUDO.PositionResolver.posFor(game, token);
      const pct = LUDO.PositionResolver.pct(pos);
      el.style.left = pct.leftPct + '%';
      el.style.top = pct.topPct + '%';
      el.style.zIndex = String(20 + (pos.z || 0));
      el.dataset.stack = String(Math.min(4, pos.stack || 1));
    },

    placeAll(game) {
      game.players.forEach((p) => p.tokens.forEach((t) => TokenRenderer.place(t, game)));
    },

    element(tokenId) { return TokenRenderer.els[tokenId] || null; },

    positionOf(tokenId) {
      const el = TokenRenderer.els[tokenId];
      if (!el) return null;
      return { left: el.style.left, top: el.style.top, z: el.style.zIndex };
    },

    setPosition(tokenId, leftPct, topPct, z) {
      const el = TokenRenderer.els[tokenId];
      if (!el) return;
      el.style.left = leftPct + '%';
      el.style.top = topPct + '%';
      if (z != null) el.style.zIndex = String(z);
    },

    setMovable(tokenIds) {
      tokenIds.forEach((id) => {
        const el = TokenRenderer.els[id];
        if (el) el.classList.add('movable');
      });
    },

    clearMovable() {
      Object.keys(TokenRenderer.els).forEach((id) => {
        TokenRenderer.els[id].classList.remove('movable', 'selected');
      });
    },

    markSelected(tokenId) {
      TokenRenderer.clearSelected();
      const el = TokenRenderer.els[tokenId];
      if (el) el.classList.add('selected');
    },

    clearSelected() {
      Object.keys(TokenRenderer.els).forEach((id) => {
        TokenRenderer.els[id].classList.remove('selected');
      });
    },

    /** Short highlight pulse (e.g. illegal click). */
    shake(tokenId) {
      const el = TokenRenderer.els[tokenId];
      if (!el) return;
      el.classList.remove('nope');
      void el.offsetWidth;   // restart animation
      el.classList.add('nope');
      setTimeout(() => el.classList.remove('nope'), 400);
    }
  };

  LUDO.TokenRenderer = TokenRenderer;
})();
