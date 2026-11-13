/* ============================================================
 * Ludo Master - dice/diceRenderer.js
 * Renders the pip faces and the roll button state.
 *
 * The dice element is moved between player panels by PlayerRenderer, so
 * this module never assumes where #dice lives. It also keeps the
 * transient state classes (clickable / rolling / landed) alive when the
 * face is redrawn, which the roll animation relies on.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  /* Pip layouts: each value -> which of the 9 grid cells are filled. */
  const PIPS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  /* Classes that describe what the dice is doing, not what it shows. */
  const STATE_CLASSES = ['clickable', 'rolling', 'landed'];

  const DiceRenderer = {
    diceEl: null,
    statusEl: null,
    rollBtn: null,
    color: null,

    init() {
      DiceRenderer.diceEl = LUDO.Utils.qs('#dice');
      DiceRenderer.statusEl = LUDO.Utils.qs('#dice-status');
      DiceRenderer.rollBtn = LUDO.Utils.qs('#btn-roll');
    },

    /** Reset the class list to "dice [extra] [colour]" and keep state classes. */
    resetClasses(extra) {
      const dice = DiceRenderer.diceEl;
      const keep = STATE_CLASSES.filter((c) => dice.classList.contains(c));
      const list = ['dice'];
      if (extra) list.push(extra);
      if (DiceRenderer.color) list.push('dice-' + DiceRenderer.color);
      dice.className = list.concat(keep).join(' ');
    },

    /** Draw a face value, tinted for the given colour. */
    render(value, color) {
      const dice = DiceRenderer.diceEl;
      if (!dice) return;
      if (color) DiceRenderer.color = color;
      DiceRenderer.resetClasses();
      dice.innerHTML = '';
      const face = LUDO.Utils.el('div', 'dice-face');
      const grid = LUDO.Utils.el('div', 'pip-grid');
      const on = PIPS[value] || PIPS[1];
      for (let i = 0; i < 9; i++) {
        const pip = LUDO.Utils.el('span', on.indexOf(i) >= 0 ? 'pip on' : 'pip');
        grid.appendChild(pip);
      }
      face.appendChild(grid);
      dice.appendChild(face);
      dice.dataset.value = String(value);
    },

    /** Neutral "waiting for a roll" face. */
    renderIdle() {
      const dice = DiceRenderer.diceEl;
      if (!dice) return;
      DiceRenderer.resetClasses('dice-idle');
      dice.innerHTML = '';
      dice.appendChild(LUDO.Utils.el('span', 'dice-idle-mark', '?'));
      dice.dataset.value = '0';
    },

    setColor(color) {
      const dice = DiceRenderer.diceEl;
      DiceRenderer.color = color || null;
      if (!dice) return;
      LUDO.CONST.COLORS.forEach((c) => dice.classList.remove('dice-' + c));
      if (color) dice.classList.add('dice-' + color);
    },

    /** Screen-reader status line (the visible hint lives in the banner). */
    setStatus(text) {
      if (DiceRenderer.statusEl) DiceRenderer.statusEl.textContent = text || '';
    },

    enable(on) {
      if (DiceRenderer.rollBtn) DiceRenderer.rollBtn.disabled = !on;
      const dice = DiceRenderer.diceEl;
      if (dice) {
        dice.classList.toggle('clickable', !!on);
        dice.setAttribute('aria-disabled', on ? 'false' : 'true');
      }
    }
  };

  LUDO.DiceRenderer = DiceRenderer;
})();
