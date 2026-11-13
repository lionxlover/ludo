/* ============================================================
 * Ludo Master - ui/soundController.js
 * WebAudio synthesizer: every sound is generated on the fly, so
 * the project needs no audio files and stays fully portable.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const Sound = {
    ctx: null,

    init() {
      /* Browsers require a user gesture before audio starts. */
      const unlock = () => {
        if (!Sound.ctx) {
          try { Sound.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
          catch (e) { Sound.ctx = null; }
        }
        if (Sound.ctx && Sound.ctx.state === 'suspended') Sound.ctx.resume();
      };
      document.addEventListener('pointerdown', unlock, { once: false });

      LUDO.Bus.on('ui:click', () => Sound.play('click'));
      LUDO.Bus.on('dice:rolled', ({ value }) => Sound.play(value === 6 ? 'six' : 'roll'));
      LUDO.Bus.on('move:step', () => Sound.play('step'));
      LUDO.Bus.on('token:captured', () => Sound.play('capture'));
      LUDO.Bus.on('token:finished', () => Sound.play('home'));
      LUDO.Bus.on('player:finished', () => Sound.play('home'));
      LUDO.Bus.on('game:over', () => Sound.play('win'));
      LUDO.Bus.on('no:moves', () => Sound.play('nope'));
    },

    enabled() {
      return !!(LUDO.State.settings.sound && Sound.ctx);
    },

    tone(freq, dur, type, gain, delay) {
      if (!Sound.ctx) return;
      const vol = (LUDO.State.settings.volume != null ? LUDO.State.settings.volume : 0.7);
      const t0 = Sound.ctx.currentTime + (delay || 0);
      const osc = Sound.ctx.createOscillator();
      const g = Sound.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.01, (gain || 0.18) * vol), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(Sound.ctx.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    },

    play(name) {
      if (!Sound.enabled()) return;
      switch (name) {
        case 'click': Sound.tone(660, 0.07, 'square', 0.08); break;
        case 'roll':
          [220, 330, 440, 520].forEach((f, i) => Sound.tone(f, 0.06, 'triangle', 0.10, i * 0.05));
          break;
        case 'step': Sound.tone(540, 0.05, 'triangle', 0.09); break;
        case 'six':
          Sound.tone(720, 0.12, 'triangle', 0.16);
          Sound.tone(1080, 0.16, 'triangle', 0.14, 0.10);
          break;
        case 'capture':
          Sound.tone(420, 0.10, 'sawtooth', 0.14);
          Sound.tone(180, 0.18, 'sawtooth', 0.14, 0.08);
          break;
        case 'home':
          Sound.tone(520, 0.10, 'triangle', 0.15);
          Sound.tone(780, 0.14, 'triangle', 0.15, 0.09);
          break;
        case 'win':
          [523, 659, 784, 1046].forEach((f, i) => Sound.tone(f, 0.18, 'triangle', 0.16, i * 0.12));
          break;
        case 'nope': Sound.tone(170, 0.16, 'square', 0.10); break;
        default: break;
      }
    }
  };

  LUDO.Sound = Sound;
})();
