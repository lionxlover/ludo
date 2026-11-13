/* ============================================================
 * Ludo Master - ui/pauseController.js
 * Pause overlay. Async helpers in Utils.sleep freeze while
 * State.paused is true, so bot timers genuinely stop.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const PauseController = {
    init() {
      const resume = LUDO.Utils.qs('#pause-resume');
      if (resume) resume.addEventListener('click', () => PauseController.set(false));

      const restart = LUDO.Utils.qs('#pause-restart');
      if (restart) restart.addEventListener('click', () => {
        PauseController.set(false);
        LUDO.GameController.rematch();
      });

      const quit = LUDO.Utils.qs('#pause-quit');
      if (quit) quit.addEventListener('click', () => {
        PauseController.set(false);
        LUDO.ModalManager.closeAll();
        LUDO.GameController.quitToMenu();
      });
    },

    toggle(on) {
      PauseController.set(on != null ? on : !LUDO.State.paused);
    },

    set(on) {
      const target = !!on;
      if (LUDO.State.paused === target) {
        if (!target) LUDO.ModalManager.close('modal-pause');
        return;
      }
      LUDO.State.paused = target;
      if (target) LUDO.ModalManager.open('modal-pause');
      else LUDO.ModalManager.close('modal-pause');
      LUDO.Bus.emit(target ? 'game:paused' : 'game:resumed');
    }
  };

  LUDO.PauseController = PauseController;
})();
