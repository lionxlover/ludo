/* ============================================================
 * Ludo Master - ui/modalManager.js
 * Generic modal handling (settings, stats, help, win, pause,
 * quit confirmation). Modals with data-static never close on
 * backdrop click.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const ModalManager = {
    lastTrigger: null,

    init() {
      LUDO.Utils.qsa('.modal').forEach((modal) => {
        modal.addEventListener('click', (ev) => {
          if (ev.target !== modal) return;
          if (modal.hasAttribute('data-static')) return;
          ModalManager.close(modal.id);
        });
        LUDO.Utils.qsa('[data-close]', modal).forEach((btn) => {
          btn.addEventListener('click', () => ModalManager.close(modal.id));
        });
      });
      /* Remember which control opened a dialog so focus can return. */
      LUDO.Utils.qsa('[data-open]').forEach((btn) => {
        btn.addEventListener('click', () => { ModalManager.lastTrigger = btn; });
      });
    },

    open(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('open');
      document.body.classList.add('modal-open');   // lock background scroll
      ModalManager.trapFocus(modal);
      LUDO.Bus.emit('modal:open', { id });
    },

    close(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.remove('open');
      if (!LUDO.Utils.qsa('.modal.open').length) {
        document.body.classList.remove('modal-open');
      }
      /* Give focus back to the control that opened this dialog. */
      if (ModalManager.lastTrigger && document.body.contains(ModalManager.lastTrigger)) {
        try { ModalManager.lastTrigger.focus(); } catch (e) { /* ignore */ }
      }
      ModalManager.lastTrigger = null;
      LUDO.Bus.emit('modal:close', { id });
    },

    closeAll() {
      LUDO.Utils.qsa('.modal.open').forEach((m) => m.classList.remove('open'));
      document.body.classList.remove('modal-open');
      if (ModalManager.lastTrigger && document.body.contains(ModalManager.lastTrigger)) {
        try { ModalManager.lastTrigger.focus(); } catch (e) { /* ignore */ }
      }
      ModalManager.lastTrigger = null;
    },

    isOpenAny() {
      return LUDO.Utils.qsa('.modal.open').length > 0;
    },

    topOpen() {
      const open = LUDO.Utils.qsa('.modal.open');
      return open.length ? open[open.length - 1].id : null;
    },

    /** Move keyboard focus into the dialog (a11y). */
    trapFocus(modal) {
      const card = modal.querySelector('.modal-card');
      if (!card) return;
      const target = card.querySelector('button, input, select, [tabindex]');
      if (target) {
        try { target.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
      }
    }
  };

  LUDO.ModalManager = ModalManager;
})();
