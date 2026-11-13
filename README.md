# Ludo Master

A complete, dependency-free Ludo game in **pure HTML + CSS + JavaScript**.
Open `index.html` in any modern browser and play - no build step, no server,
no frameworks.

## Features

**Gameplay**
- Classic 15x15 Ludo board with the full 52-cell shared track, 4 home
  columns and centre finish.
- 2-4 players: hotseat (pass-and-play), human vs AI bots, or pure
  bot-vs-bot spectating with auto-rematch.
- Partners (team) mode: Red + Yellow vs Green + Blue.
- All four seats can be Human or Bot; every bot has its own difficulty
  (Easy / Normal / Hard).
- Easy bot: casual random play. Normal: greedy heuristics. Hard: heuristics
  plus a one-ply simulation of the best candidate moves on a cloned game.

**Rules (all toggleable in Settings / menu)**
- 6 required to leave the base (can be relaxed to 1 or 6).
- Extra turn on a 6, on a capture, and on finishing a token.
- Three consecutive 6s forfeit the turn.
- Safe cells: the four coloured start cells plus four star cells.
- Blockades: two same-colour tokens on a track cell stop opponents from
  passing or landing.
- Exact roll required to reach the centre, or a relaxed bounce-back mode.

**Experience**
- Four themes - **Light, Dark, Sorbet, Walnut** (T key or the palette button
  cycles them). Until you pick one the game follows your device's
  light / dark setting.
- Step-by-step token animation, dice shake animation, capture fly-backs,
  confetti victory burst.
- WebAudio synthesized sound effects (dice, steps, captures, fanfare) -
  no audio files needed; volume slider and mute.
- Autosave: an unfinished game is stored and can be resumed from the menu.
- Lifetime statistics (games, rolls, sixes, captures, tokens finished,
  best game, wins by name) in localStorage.
- Move log panel, roll history strip, toast notifications.
- Pause overlay, quit confirmation, rematch flow.
- Keyboard controls: Space/Enter roll, 1-4 pick token, Esc close/pause,
  M mute, P pause, T theme.

## Look & feel

The interface is styled after iOS (system colours, SF-style type, frosted
glass bars, hairline separators, iOS switches / segmented controls /
bottom sheets) and laid out like the popular Android Ludo apps (Ludo Master /
Ludo King):

- **Home screen** - big stacked mode buttons (Resume, Quick Play, Custom
  Game, Watch AI vs AI), round How to Play / Statistics / Settings buttons,
  quick stats.
- **In game** - the board is centred and each player has a panel in the
  corner of the board their colour owns. The **dice jumps next to whoever is
  on turn** (in their colour), the active panel glows, finished players get
  a rank badge and the win screen shows ranked standings.
- **Dialogs** - bottom sheets on phones (with a grabber), centred cards on
  tablets / desktops / landscape phones, iOS-style alerts for pause and quit.

## Responsive behaviour

One layout engine, driven by the **aspect ratio** of the window rather than
by device names, so every phone, tablet and desktop size works in either
orientation:

| Window | Layout |
|--------|--------|
| Portrait (phones, tablets, narrow windows) | two panels above the board, two below, dice in the middle column of the row of the active player, banner + recent rolls underneath |
| Landscape (wider than 6:5) | panels, dice, banner and move log in a column on each side of the board; the board is as tall as the window allows |
| Short landscape (phones on their side) | same, compacted: smaller panels, move log hidden, two-column dialogs |

Details that make it hold together:

- The game screen is exactly one viewport tall and never scrolls the page.
  The board is sized from the free height *and* width; leftover height goes
  to the player panels (up to a cap) and the rest is centred.
- Panels and dice scale with the board; player names and avatars also scale
  with each panel's own width (CSS container queries), so long names wrap to
  two lines instead of being cut - 320px phones to 2560px monitors.
- Tokens are positioned in percentages of the board, stacked tokens are
  fanned out, and positions are re-applied after every move.
- Safe-area insets (notches), `dvh` viewport units, 40-44px touch targets
  (hit areas are padded beyond the drawn size), no iOS zoom on inputs,
  `prefers-reduced-motion` honoured, `prefers-color-scheme` followed.
- Light and dark glass fall back gracefully where `backdrop-filter`,
  `color-mix()` or container units are missing.

## How to run

1. Unzip the project.
2. Open `index.html` in Chrome, Edge, Firefox or Safari.

(Double-clicking works; if your browser blocks some localStorage features
on `file://` URLs, serve the folder instead, e.g. `python3 -m http.server`
and visit `http://localhost:8000`.)

## Project structure

```
ludo-game/
  index.html          single page: menu, game screen, 6 modals
  css/                exactly 10 stylesheets
    variables.css     design tokens: 4 palettes, layout, type, radii, motion
    base.css          reset, buttons, iOS switches / segmented controls / lists
    layout.css        game screen: nav bar, portrait + landscape grids, sizing
    menu.css          home screen and the player rows of the setup sheet
    board.css         board frame, cells, bases, centre
    tokens.css        token pieces and states
    dice.css          dice cube, pips, roll history
    panels.css        player panels, dice slot, turn banner, move log
    modals.css        sheets, alerts, settings, stats, win card, toasts
    animations.css    keyframes + reduced motion
  js/                 57 modules on the window.LUDO namespace
    core/             constants, utils, eventBus, storage, logger,
                      i18n, state, main
    config/           boardConfig, pathBuilder, safeCells
    board/            cellManager, boardRenderer, tokenRenderer,
                      tokenAnimator, highlightManager, positionResolver
    dice/             diceModel, diceRenderer, diceAnimator,
                      diceHistory, diceController
    players/          playerModel, playerFactory, turnManager,
                      playerRenderer
    rules/            spawnRules, captureRules, blockadeRules,
                      finishRules, moveValidator, rulesEngine
    game/             gameSetup, ranking, winDetector, gameController,
                      moveExecutor, historyLogger, autoPlay
    ai/               aiEvaluator, aiEasy, aiNormal, aiHard, aiEngine
    ui/               screenManager, modalManager, toast,
                      soundController, themeManager, settingsController,
                      statsController, helpController, confetti,
                      gameScreenController, keyboardController,
                      pauseController, menuController
```

## Architecture notes

- Every module attaches to `window.LUDO` and communicates through a tiny
  event bus (`LUDO.Bus`), so rules logic is fully separated from the DOM.
- The rules engine (`js/rules/`) and the AI (`js/ai/`) are pure modules:
  they never touch the DOM, which makes them testable outside a browser.
- Token positions are expressed as "progress" 0..57 (0 = base, 1-51 =
  shared track, 52-56 = home column, 57 = centre), and each colour's
  absolute path is built once by `pathBuilder.js`.
- Game state is plain JSON, which is what makes autosave trivial.

## License

MIT - do whatever you like with it.
