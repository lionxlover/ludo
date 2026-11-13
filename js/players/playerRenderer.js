/* ============================================================
 * Ludo Master - players/playerRenderer.js
 * Player panels around the board (one per corner): avatar, name,
 * type tag, home pips, captures, finishing rank. The panel of the
 * player whose turn it is also receives the dice.
 *
 * Each panel is { .seat-card (the visible card), .seat-dice (the slot
 * the dice moves into) } inside a display:contents wrapper, so the
 * layout grid can place both parts independently.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  /* Small robot head used as the avatar of computer players. */
  const BOT_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<rect x="4.5" y="8.5" width="15" height="11" rx="4"/><path d="M12 8.5V5.7"/>' +
    '<circle cx="12" cy="4.6" r="1.3"/><circle class="eye" cx="9" cy="14" r="1.4"/>' +
    '<circle class="eye" cx="15" cy="14" r="1.4"/></svg>';

  function initialOf(name) {
    const s = String(name || '').trim();
    return s ? s.charAt(0).toUpperCase() : '?';
  }

  const PlayerRenderer = {
    panelEl: null,
    homeEl: null,
    cards: {},

    init() {
      PlayerRenderer.panelEl = LUDO.Utils.qs('#players-panel');
      PlayerRenderer.homeEl = LUDO.Utils.qs('#dice-home');
    },

    /** Move the dice back to its hidden holder (before a panel is destroyed). */
    parkDice() {
      const dice = LUDO.DiceRenderer.diceEl || LUDO.Utils.qs('#dice');
      const home = PlayerRenderer.homeEl;
      if (dice && home && dice.parentNode !== home) home.appendChild(dice);
      LUDO.Utils.qsa('.seat-dice.arrive').forEach((s) => s.classList.remove('arrive'));
    },

    /** Put the dice into this colour's panel. */
    placeDice(color) {
      const card = PlayerRenderer.cards[color];
      const dice = LUDO.DiceRenderer.diceEl || LUDO.Utils.qs('#dice');
      if (!card || !dice) return;
      const slot = card.querySelector('.seat-dice');
      if (!slot || dice.parentNode === slot) return;
      slot.appendChild(dice);
      slot.classList.remove('arrive');
      void slot.offsetWidth;            // restart the arrival animation
      slot.classList.add('arrive');
    },

    renderAll(game) {
      if (!PlayerRenderer.panelEl) return;
      PlayerRenderer.parkDice();
      PlayerRenderer.panelEl.innerHTML = '';
      PlayerRenderer.cards = {};

      game.players.forEach((player) => {
        const isBot = player.type === 'ai';
        const card = LUDO.Utils.el(
          'div', 'player-card card-' + player.color + (isBot ? ' is-bot' : ' is-human'));
        card.dataset.color = player.color;

        const seat = LUDO.Utils.el('div', 'seat-card');

        const avatar = LUDO.Utils.el('div', 'pc-avatar');
        avatar.setAttribute('aria-hidden', 'true');
        if (isBot) avatar.innerHTML = BOT_ICON;
        else avatar.textContent = initialOf(player.name);
        avatar.appendChild(LUDO.Utils.el('span', 'pc-rank'));

        const main = LUDO.Utils.el('div', 'pc-main');

        const head = LUDO.Utils.el('div', 'pc-head');
        /* A name with a space may wrap onto a second line ("Bot / Comet"); a single
         * long word is cut with an ellipsis instead of being broken mid-word. */
        const nm = String(player.name).trim();
        head.appendChild(LUDO.Utils.el(
          'span',
          'pc-name' + (/\s/.test(nm) ? '' : ' pc-name-one' + (nm.length >= 9 ? ' pc-name-long' : '')),
          player.name
        ));
        if (game.teams && player.team) {
          head.appendChild(LUDO.Utils.el('span', 'pc-team', player.team));
        }

        const sub = LUDO.Utils.el('div', 'pc-sub');
        sub.appendChild(LUDO.Utils.el(
          'span', 'pc-tag',
          isBot
            ? LUDO.I18N.t('bot') + ' · ' + LUDO.Utils.cap(player.aiLevel)
            : LUDO.I18N.t('humans')
        ));
        sub.appendChild(LUDO.Utils.el('span', 'pc-captures', ''));

        const dots = LUDO.Utils.el('div', 'pc-dots');
        for (let i = 0; i < 4; i++) {
          dots.appendChild(LUDO.Utils.el('span', 'pc-home dot-' + player.color));
        }

        main.appendChild(head);
        main.appendChild(sub);
        main.appendChild(dots);
        seat.appendChild(avatar);
        seat.appendChild(main);

        const slot = LUDO.Utils.el('div', 'seat-dice');
        slot.dataset.color = player.color;

        card.appendChild(seat);
        card.appendChild(slot);
        card.setAttribute('aria-label', player.name);
        PlayerRenderer.panelEl.appendChild(card);
        PlayerRenderer.cards[player.color] = card;
        PlayerRenderer.update(player);
      });
    },

    /** Refresh one panel's pips, counters and rank badge. */
    update(player) {
      const card = PlayerRenderer.cards[player.color];
      if (!card) return;
      const home = LUDO.FinishRules.homeCount(player);
      const dots = card.querySelectorAll('.pc-home');
      dots.forEach((d, i) => d.classList.toggle('done', i < home));
      const wrap = card.querySelector('.pc-dots');
      if (wrap) {
        const hint = LUDO.I18N.t('homeHint') + ': ' + home + '/4';
        wrap.title = hint;
        wrap.setAttribute('role', 'img');
        wrap.setAttribute('aria-label', hint);
      }
      const cap = card.querySelector('.pc-captures');
      if (cap) {
        cap.textContent = LUDO.I18N.t(player.captures === 1 ? 'captureOne' : 'captureMany',
          { n: player.captures });
      }
      card.classList.toggle('finished', !!player.finished);
      const rank = card.querySelector('.pc-rank');
      if (rank) rank.textContent = player.rank != null ? String(player.rank) : '';
    },

    updateAll(game) {
      game.players.forEach((p) => PlayerRenderer.update(p));
    },

    /** Mark whose turn it is and bring the dice over to that panel. */
    setActive(color) {
      Object.keys(PlayerRenderer.cards).forEach((c) => {
        PlayerRenderer.cards[c].classList.toggle('active', c === color);
      });
      if (color) {
        document.body.dataset.turn = color;
        PlayerRenderer.placeDice(color);
      } else {
        delete document.body.dataset.turn;
        PlayerRenderer.parkDice();
      }
    },

    clearActive() {
      PlayerRenderer.setActive(null);
    }
  };

  LUDO.PlayerRenderer = PlayerRenderer;
})();
