/* ============================================================
 * Ludo Master - core/i18n.js
 * UI strings. English ships by default; add another dictionary
 * below and call LUDO.I18N.setLang('xx') to translate the game.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const STRINGS = {
    en: {
      title: 'Ludo Master',
      tagline: 'The classic race home – four colours, one crown',
      play: 'Play',
      quickPlay: 'Quick Play',
      customGame: 'Custom Game',
      watchAI: 'Watch AI vs AI',
      resume: 'Resume Game',
      howToPlay: 'How to Play',
      stats: 'Statistics',
      settings: 'Settings',
      startGame: 'Start Game',
      backToMenu: 'Main Menu',
      pause: 'Pause',
      resumeGame: 'Resume',
      restart: 'Restart',
      quit: 'Quit to Menu',
      rollDice: 'Roll Dice',
      rollNow: 'Roll the dice',
      rollTap: 'Tap the dice to roll',
      rollClick: 'Click the dice to roll',
      thinkingShort: 'Thinking…',
      captureOne: '{n} capture',
      captureMany: '{n} captures',
      pickToken: 'Pick a token to move',
      noMoves: 'No possible move',
      bannerIdle: 'Roll the dice to begin',
      homeHint: 'Tokens finished',
      teamsOn: 'Team mode on – all four seats are active',
      youWin: 'You win the game!',
      scoreLegend: 'Score = total steps travelled',
      statsCleared: 'Statistics cleared',
      extraTurn: 'Extra turn!',
      sixRolled: 'Six! Roll again',
      threeSixes: 'Three sixes in a row – turn forfeited',
      captured: '{a} captured {b}!',
      finishedToken: '{c} finished a token',
      playerFinished: '{c} finished in place #{r}',
      winnerIs: '{c} wins the game!',
      gameOver: 'Victory',
      rematch: 'Rematch',
      humans: 'Human',
      bot: 'Bot',
      off: 'Off',
      turnOf: "{c}'s turn",
      turnRoll: "{c}'s turn – roll the dice",
      turnNoMove: "{c}'s turn – no legal move",
      thinking: '{c} is thinking…',
      red: 'Red', green: 'Green', yellow: 'Yellow', blue: 'Blue',
      paused: 'Game paused',
      quitConfirm: 'Quit this game and return to the menu?',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Done',
      reset: 'Reset',
      captures: 'Captures',
      tokensHome: 'Home',
      games: 'Games',
      wins: 'Wins'
    }
  };

  let lang = 'en';

  function t(key, vars) {
    const dict = STRINGS[lang] || STRINGS.en;
    let s = dict[key] != null ? dict[key] : (STRINGS.en[key] != null ? STRINGS.en[key] : key);
    if (vars) {
      Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(String(vars[k])); });
    }
    return s;
  }

  function apply(root) {
    LUDO.Utils.qsa('[data-i18n]', root || document).forEach((node) => {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
  }

  LUDO.I18N = {
    t, apply,
    setLang(l) { if (STRINGS[l]) lang = l; },
    lang: () => lang,
    STRINGS
  };
})();
