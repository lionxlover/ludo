/* ============================================================
 * Ludo Master - ui/helpController.js
 * Rules / how-to-play modal.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const HelpController = {
    init() {
      LUDO.Utils.qsa('[data-open="modal-help"]').forEach((b) => {
        b.addEventListener('click', () => LUDO.ModalManager.open('modal-help'));
      });
    }
  };

  LUDO.HelpController = HelpController;
})();
