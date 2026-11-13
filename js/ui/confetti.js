/* ============================================================
 * Ludo Master - ui/confetti.js
 * Canvas confetti burst for victory moments.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const Confetti = {
    canvas: null,
    ctx: null,
    parts: [],
    raf: null,

    init() {
      Confetti.canvas = LUDO.Utils.qs('#confetti-canvas');
      if (!Confetti.canvas) return;
      Confetti.ctx = Confetti.canvas.getContext('2d');
      const resize = () => {
        Confetti.canvas.width = window.innerWidth;
        Confetti.canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize);
      resize();
    },

    burst() {
      if (!Confetti.canvas || !Confetti.ctx) return;
      const colors = LUDO.CONST.COLORS.map((c) => LUDO.CONST.COLOR_HEX[c]);
      const W = Confetti.canvas.width;

      /* Side cannons + centre rain, in two waves for a richer effect. */
      const spawn = (n, originX, spread, speedBias) => {
        for (let i = 0; i < n; i++) {
          Confetti.parts.push({
            x: originX + (Math.random() - 0.5) * spread,
            y: -20 - Math.random() * H_FALL(),
            w: 5 + Math.random() * 6,
            h: 8 + Math.random() * 8,
            vy: 1.8 + Math.random() * 2.6 + speedBias,
            vx: -1.6 + Math.random() * 3.2,
            rot: Math.random() * Math.PI * 2,
            vr: -0.12 + Math.random() * 0.24,
            sway: 0.5 + Math.random() * 1.6,
            phase: Math.random() * Math.PI * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: Math.random() < 0.25 ? 'circle' : 'rect',
            life: 180 + Math.random() * 120
          });
        }
      };
      function H_FALL() { return Confetti.canvas.height * 0.35; }

      spawn(120, W / 2, W * 0.6, 0);
      setTimeout(() => {
        if (Confetti.parts.length || Math.random() < 2) {
          spawn(70, W * 0.18, 120, 0.4);
          spawn(70, W * 0.82, 120, 0.4);
          if (!Confetti.raf) Confetti.tick();
        }
      }, 420);
      if (!Confetti.raf) Confetti.tick();
    },

    tick() {
      const { ctx, canvas } = Confetti;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Confetti.parts = Confetti.parts.filter((p) => p.life > 0 && p.y < canvas.height + 30);

      Confetti.parts.forEach((p) => {
        p.phase += 0.06;
        p.x += p.vx + Math.sin(p.phase) * p.sway * 0.4;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 60);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      if (Confetti.parts.length) {
        Confetti.raf = requestAnimationFrame(() => Confetti.tick());
      } else {
        Confetti.raf = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  LUDO.Confetti = Confetti;
})();
