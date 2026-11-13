/* ============================================================
 * Ludo Master - ui/gameScreenController.js
 * Top bar, turn banner, win modal contents, game-screen glue.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  /* Phones and tablets tap; desktops click. The hint should say so. */
  function isTouch() {
    return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }

  const GameScreenController = {
    banner: null,

    init() {
      GameScreenController.banner = LUDO.Utils.qs('#turn-banner');

      const btnMenu = LUDO.Utils.qs('#btn-topmenu');
      if (btnMenu) btnMenu.addEventListener('click', () => LUDO.ModalManager.open('modal-quit'));

      const confirmQuit = LUDO.Utils.qs('#quit-confirm');
      if (confirmQuit) confirmQuit.addEventListener('click', () => {
        LUDO.ModalManager.closeAll();
        LUDO.GameController.quitToMenu();
      });

      const btnPause = LUDO.Utils.qs('#btn-pause');
      if (btnPause) btnPause.addEventListener('click', () => LUDO.PauseController.toggle(true));

      const btnSound = LUDO.Utils.qs('#btn-sound');
      if (btnSound) btnSound.addEventListener('click', () => {
        LUDO.State.settings.sound = !LUDO.State.settings.sound;
        LUDO.State.saveSettings();
        GameScreenController.syncSound();
        LUDO.Toast.show('Sound ' + (LUDO.State.settings.sound ? 'on' : 'off'), 'info');
      });

      /* Win modal actions. */
      const winRematch = LUDO.Utils.qs('#win-rematch');
      if (winRematch) winRematch.addEventListener('click', () => LUDO.GameController.rematch());
      const winMenu = LUDO.Utils.qs('#win-menu');
      if (winMenu) winMenu.addEventListener('click', () => {
        LUDO.ModalManager.closeAll();
        LUDO.GameController.quitToMenu();
      });

      LUDO.Bus.on('theme:changed', () => GameScreenController.syncSound());
      LUDO.Bus.on('no:moves', ({ player }) => GameScreenController.onNoMoves(player));
    },

    syncSound() {
      const btn = LUDO.Utils.qs('#btn-sound');
      if (!btn) return;
      const on = !!LUDO.State.settings.sound;
      btn.classList.toggle('off', !on);
      btn.title = 'Sound ' + (on ? 'on' : 'off');
    },

    onGameStart(game) {
      GameScreenController.syncSound();
      const teamsNote = LUDO.Utils.qs('#teams-note');
      if (teamsNote) teamsNote.classList.toggle('hidden', !game.teams);
    },

    /** (Re)draw the banner: colour dot, bold name, muted sub text. */
    setBanner(player, text, extraClass) {
      const banner = GameScreenController.banner;
      if (!banner) return;
      banner.innerHTML = '';
      banner.appendChild(LUDO.Utils.el('span', 'banner-dot'));
      banner.appendChild(LUDO.Utils.el('b', 'banner-name', player.name));
      banner.appendChild(LUDO.Utils.el('span', 'banner-sub', text || ''));
      banner.className = 'turn-banner banner-' + player.color + (extraClass ? ' ' + extraClass : '');
    },

    /** Change only the sub text of the current banner. */
    setSub(text) {
      const sub = GameScreenController.banner &&
                  GameScreenController.banner.querySelector('.banner-sub');
      if (sub) sub.textContent = text || '';
    },

    /** Update the banner AND the screen-reader status line. */
    say(text) {
      GameScreenController.setSub(text);
      LUDO.DiceRenderer.setStatus(text);
    },

    onTurnStart(player) {
      const isAI = player.type === 'ai';
      const text = isAI
        ? LUDO.I18N.t('thinkingShort')
        : LUDO.I18N.t(isTouch() ? 'rollTap' : 'rollClick');
      GameScreenController.setBanner(player, text, isAI ? 'thinking' : '');
      LUDO.DiceRenderer.setStatus(
        isAI ? '' : player.name + ': ' + LUDO.I18N.t('rollNow'));
    },

    /** Reflect a skipped turn (no legal move) in the banner. */
    onNoMoves(player) {
      GameScreenController.setSub(LUDO.I18N.t('noMoves'));
      if (GameScreenController.banner) GameScreenController.banner.classList.remove('thinking');
    },

    onGameOver(game, name) {
      const banner = GameScreenController.banner;
      if (banner) {
        banner.innerHTML = '';
        banner.appendChild(LUDO.Utils.el('b', 'banner-name', LUDO.I18N.t('gameOver')));
        banner.appendChild(LUDO.Utils.el('span', 'banner-sub', name));
        banner.className = 'turn-banner banner-over';
      }

      /* Standings list in the win modal. */
      const list = LUDO.Utils.qs('#win-standings');
      if (list) {
        list.innerHTML = '';
        LUDO.Ranking.standings(game).forEach((p, i) => {
          const row = LUDO.Utils.el('li', 'stand-row' + (i === 0 ? ' winner' : ''));
          const medal = LUDO.Utils.el('span', 'stand-rank rank-' + (i + 1), String(i + 1));
          const dot = LUDO.Utils.el('span', 'pc-dot dot-' + p.color);
          const nameEl = LUDO.Utils.el('span', 'stand-name',
            p.name + (p.finished ? (game.teams ? ' – Team ' + p.team : '') : ''));
          const tag = LUDO.Utils.el('span', 'stand-tag',
            (p.type === 'ai' ? LUDO.I18N.t('bot') : LUDO.I18N.t('humans')) +
            ' · score ' + LUDO.FinishRules.score(p));
          row.appendChild(medal);
          row.appendChild(dot);
          row.appendChild(nameEl);
          row.appendChild(tag);
          list.appendChild(row);
        });
      }
      const title = LUDO.Utils.qs('#win-title');
      if (title) {
        title.textContent = name === 'You'
          ? LUDO.I18N.t('youWin')
          : LUDO.I18N.t('winnerIs', { c: name });
      }
      const sub = LUDO.Utils.qs('#win-sub');
      if (sub) {
        const turns = game.turnCount;
        sub.textContent = LUDO.I18N.t('gameOver') + ' · ' + turns + ' ' + (turns === 1 ? 'turn' : 'turns');
        sub.classList.remove('hidden');
      }
    }
  };

  LUDO.GameScreenController = GameScreenController;
})();
