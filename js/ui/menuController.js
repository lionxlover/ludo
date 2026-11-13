/* ============================================================
 * Ludo Master - ui/menuController.js
 * Main menu: player setup cards, mode buttons, rule toggles,
 * resume detection. Feeds a config object into GameController.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const DEFAULT_SEATS = [
    { color: 'red', type: 'human', level: 'normal' },
    { color: 'green', type: 'ai', level: 'normal' },
    { color: 'yellow', type: 'ai', level: 'normal' },
    { color: 'blue', type: 'ai', level: 'normal' }
  ];

  const MenuController = {
    seats: [],

    init() {
      const wrap = LUDO.Utils.qs('#player-setup');
      if (!wrap) return;
      wrap.innerHTML = '';
      MenuController.seats = [];

      LUDO.CONST.COLORS.forEach((color, i) => {
        const def = DEFAULT_SEATS[i];
        const label = LUDO.BoardConfig.LABEL[color];
        const card = LUDO.Utils.el('div', 'seat-card seat-' + color);

        /* Row 1: coloured avatar + name field. */
        const head = LUDO.Utils.el('div', 'seat-head');
        const avatar = LUDO.Utils.el('span', 'seat-avatar');
        avatar.setAttribute('aria-hidden', 'true');
        head.appendChild(avatar);

        const name = LUDO.Utils.el('input', 'seat-name');
        name.type = 'text';
        name.maxLength = 14;
        name.placeholder = label;
        name.autocomplete = 'off';
        name.setAttribute('aria-label', label + ' player name');
        name.value = def.type === 'ai' && i > 0 ? 'Bot ' + label : '';
        head.appendChild(name);
        card.appendChild(head);

        /* Row 2: Human / Bot / Off + difficulty. */
        const ctl = LUDO.Utils.el('div', 'seat-ctl');
        const seg = LUDO.Utils.el('div', 'seg');
        seg.setAttribute('role', 'group');
        seg.setAttribute('aria-label', label + ' seat type');
        const segBtns = {};
        [['human', LUDO.I18N.t('humans')], ['ai', LUDO.I18N.t('bot')], ['off', LUDO.I18N.t('off')]]
          .forEach(([val, text]) => {
            const b = LUDO.Utils.el('button', 'seg-btn', text);
            b.type = 'button';
            b.dataset.value = val;
            b.addEventListener('click', () => {
              seat.type = val;
              seg.querySelectorAll('.seg-btn').forEach((x) => x.classList.remove('on'));
              b.classList.add('on');
              /* Keep every card the same height: the level select stays
                 visible but disabled when the seat is not a bot. */
              levelSel.disabled = val !== 'ai';
              levelWrap.classList.toggle('dim', val !== 'ai');
              MenuController.refreshSeat(seat);
              MenuController.normalizeTeams();
            });
            seg.appendChild(b);
            segBtns[val] = b;
          });
        ctl.appendChild(seg);

        const levelWrap = LUDO.Utils.el('div', 'seat-level');
        const levelSel = LUDO.Utils.el('select', 'seat-select');
        ['easy', 'normal', 'hard'].forEach((lv) => {
          const opt = LUDO.Utils.el('option', null, LUDO.Utils.cap(lv));
          opt.value = lv;
          levelSel.appendChild(opt);
        });
        levelSel.value = def.level;
        levelSel.disabled = def.type !== 'ai';
        levelSel.setAttribute('aria-label', 'Difficulty for ' + label);
        levelSel.addEventListener('change', () => { seat.level = levelSel.value; });
        levelWrap.appendChild(levelSel);
        ctl.appendChild(levelWrap);
        card.appendChild(ctl);

        const seat = { color, type: def.type, level: def.level, nameEl: name, segBtns, card, avatar };
        segBtns[def.type].classList.add('on');
        levelWrap.classList.toggle('dim', def.type !== 'ai');
        name.addEventListener('input', () => MenuController.refreshSeat(seat));
        MenuController.refreshSeat(seat);

        wrap.appendChild(card);
        MenuController.seats.push(seat);
      });

      MenuController.bindButtons();
      MenuController.bindToggles();
      MenuController.refreshQuickStats();
    },

    /** Keep a seat card's avatar (initial or robot) and dimming in sync. */
    refreshSeat(seat) {
      const label = LUDO.BoardConfig.LABEL[seat.color];
      seat.card.classList.toggle('is-off', seat.type === 'off');
      seat.card.classList.toggle('is-bot', seat.type === 'ai');
      if (seat.type === 'ai') {
        seat.avatar.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<rect x="4.5" y="8.5" width="15" height="11" rx="4"/><path d="M12 8.5V5.7"/>' +
          '<circle cx="12" cy="4.6" r="1.3"/><circle class="eye" cx="9" cy="14" r="1.4"/>' +
          '<circle class="eye" cx="15" cy="14" r="1.4"/></svg>';
      } else {
        const typed = seat.nameEl.value.trim();
        seat.avatar.textContent = (typed || label).charAt(0).toUpperCase();
      }
    },

    /** Tiny stats preview shown under the menu action buttons. */
    refreshQuickStats() {
      const stats = LUDO.State.stats || {};
      const games = document.getElementById('qs-games');
      const wins = document.getElementById('qs-wins');
      const best = document.getElementById('qs-best');
      if (games) games.textContent = String(stats.games || 0);
      if (wins) {
        const total = Object.keys(stats.wins || {})
          .reduce((s, n) => s + stats.wins[n], 0);
        wins.textContent = String(total);
      }
      if (best) best.textContent = stats.bestTurns == null ? '—' : String(stats.bestTurns);
    },

    bindButtons() {
      const bind = (id, fn) => {
        const b = document.getElementById(id);
        if (b) b.addEventListener('click', fn);
      };
      bind('btn-quick', () => LUDO.GameController.start(LUDO.GameSetup.quickConfig()));
      bind('btn-watch', () => LUDO.GameController.start(LUDO.GameSetup.watchConfig()));
      bind('btn-resume', () => LUDO.GameController.startFromSave());
      bind('btn-custom', () => {
        LUDO.SettingsController.sync();
        LUDO.ModalManager.open('modal-setup');
      });
      bind('btn-start', () => MenuController.startFromSetup());
    },

    bindToggles() {
      const teams = LUDO.Utils.qs('#set-teams-menu');
      if (teams) teams.addEventListener('change', () => {
        MenuController.normalizeTeams();
      });
      LUDO.Utils.qsa('#menu-rules [data-rule]').forEach((box) => {
        const key = box.getAttribute('data-rule');
        box.checked = !!LUDO.State.rules[key];
        box.addEventListener('change', () => {
          LUDO.State.rules[key] = box.checked;
          LUDO.State.saveSettings();
          LUDO.SettingsController.sync();
        });
      });
    },

    /** Team mode forces all four seats active. */
    normalizeTeams() {
      const teams = LUDO.Utils.qs('#set-teams-menu');
      if (!teams || !teams.checked) return;
      MenuController.seats.forEach((seat) => {
        if (seat.type === 'off') {
          seat.type = 'ai';
          seat.segBtns.ai.click();
        }
      });
      LUDO.Toast.show(LUDO.I18N.t('teamsOn'), 'info');
    },

    collectConfig() {
      const teams = LUDO.Utils.qs('#set-teams-menu');
      return {
        players: MenuController.seats.map((seat) => ({
          color: seat.color,
          name: seat.nameEl.value.trim() ||
                (seat.type === 'ai' ? 'Bot ' + LUDO.BoardConfig.LABEL[seat.color]
                                    : LUDO.BoardConfig.LABEL[seat.color]),
          type: seat.type,
          aiLevel: seat.level
        })),
        teams: !!(teams && teams.checked),
        rules: Object.assign({}, LUDO.State.rules),
        spectate: false
      };
    },

    startFromSetup() {
      const config = MenuController.collectConfig();
      const err = LUDO.GameSetup.validate(config);
      if (err) { LUDO.Toast.show(err, 'error'); return; }
      LUDO.ModalManager.closeAll();
      LUDO.GameController.start(config);
    },

    /** Show/hide the Resume button based on autosave presence. */
    refreshResume() {
      const btn = LUDO.Utils.qs('#btn-resume');
      if (!btn) return;
      const save = LUDO.Store.get(LUDO.CONST.KEYS.SAVE, null);
      btn.classList.toggle('hidden', !save);
    }
  };

  LUDO.MenuController = MenuController;
})();
