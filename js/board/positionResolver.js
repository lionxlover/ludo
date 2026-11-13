/* ============================================================
 * Ludo Master - board/positionResolver.js
 * Converts token state into pixel coordinates. Pure module: it
 * only reads the game object, so the headless AI harness can use
 * the rules engine without a DOM.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const SIZE = 15;

  function tokenOnTrack(token) {
    return token && token.progress >= 1 && token.progress <= 51;
  }

  /** Every token (any colour) standing on shared track cell abs. */
  function tokensAtAbs(game, abs) {
    const out = [];
    game.players.forEach((p) => {
      p.tokens.forEach((t) => {
        if (tokenOnTrack(t) && LUDO.PathBuilder.absFor(t.color, t.progress) === abs) out.push(t);
      });
    });
    return out;
  }

  /* Offsets (in cells) for tokens sharing one cell. They pair with the
   * piece sizes in tokens.css ([data-stack] 2/3/4 = 0.50 / 0.46 / 0.44 of a
   * cell), so stacked tokens sit side by side without overlapping and stay
   * inside their cell. */
  function stackOffsets(n, sameColorPair) {
    if (n <= 1) return [{ dx: 0, dy: 0 }];
    if (n === 2) {
      return sameColorPair
        ? [{ dx: -0.25, dy: 0 }, { dx: 0.25, dy: 0 }]
        : [{ dx: -0.25, dy: -0.14 }, { dx: 0.25, dy: 0.14 }];
    }
    if (n === 3) {
      return [{ dx: -0.26, dy: -0.17 }, { dx: 0.26, dy: -0.17 }, { dx: 0, dy: 0.27 }];
    }
    return [
      { dx: -0.26, dy: -0.26 }, { dx: 0.26, dy: -0.26 },
      { dx: -0.26, dy: 0.26 }, { dx: 0.26, dy: 0.26 }
    ];
  }

  /**
   * Position of one token in continuous cell units {x, y, z}.
   * x/y are the token's centre; z is a stacking hint for z-index and
   * stack is how many tokens share the spot (the renderer shrinks them).
   */
  function posFor(game, token) {
    if (token.progress <= 0) {
      const slot = LUDO.BoardConfig.BASE_SLOTS[token.color][token.idx];
      return { x: slot.x, y: slot.y, z: 10, stack: 1 };
    }
    const path = LUDO.PathBuilder.PATH[token.color];
    const step = path[token.progress - 1];
    if (!step) return { x: 7.5, y: 7.5, z: 10, stack: 1 };

    if (step.centre) {
      /* Finished tokens fan out slightly inside the centre triangle. */
      const spot = LUDO.BoardConfig.FINISH_SPOT[token.color];
      const done = game.players
        .find((p) => p.color === token.color)
        .tokens.filter((t) => t.progress === 57);
      const k = Math.max(0, done.findIndex((t) => t.id === token.id));
      const spread = (k - (done.length - 1) / 2) * 0.34;
      const vertical = token.color === 'red' || token.color === 'yellow';
      return {
        x: spot.x + (vertical ? 0 : spread),
        y: spot.y + (vertical ? spread : 0),
        z: 12,
        stack: Math.max(1, done.length)
      };
    }

    let x = step.c + 0.5;
    let y = step.r + 0.5;
    let z = 11;

    if (step.home) {
      /* Home column: only your own tokens can be here, side by side. */
      const siblings = game.players
        .find((p) => p.color === token.color)
        .tokens.filter((t) => t.progress === token.progress);
      const k = Math.max(0, siblings.findIndex((t) => t.id === token.id));
      if (siblings.length > 1) {
        const offs = stackOffsets(siblings.length, true);
        const o = offs[k % offs.length];
        x += o.dx; y += o.dy;
      }
      return { x, y, z: 11 + k, stack: siblings.length };
    }

    /* Shared track: resolve stacking with everyone on this cell. */
    const abs = step.abs;
    const group = tokensAtAbs(game, abs);
    const stack = Math.max(1, group.length);
    if (group.length > 1) {
      const k = Math.max(0, group.findIndex((t) => t.id === token.id));
      const sameColorPair = group.length === 2 && group[0].color === group[1].color;
      const offs = stackOffsets(group.length, sameColorPair && game.rules.blockades);
      const o = offs[k % offs.length];
      x += o.dx; y += o.dy;
      z = 20 + k;
    }
    return { x, y, z, stack };
  }

  /** Convert cell units to percentages for CSS positioning. */
  function pct(pos) {
    return {
      leftPct: (pos.x / SIZE) * 100,
      topPct: (pos.y / SIZE) * 100
    };
  }

  LUDO.PositionResolver = { posFor, pct, tokensAtAbs, stackOffsets };
})();
