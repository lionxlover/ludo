/* ============================================================
 * Ludo Master - ui/toast.js
 * Stacked transient notifications (info / success / warn).
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const Toast = {
    container: null,
    DURATION: 2600,

    init() {
      Toast.container = LUDO.Utils.qs('#toast-container');
    },

    show(msg, type) {
      if (!Toast.container || !msg) return;
      const t = LUDO.Utils.el('div', 'toast toast-' + (type || 'info'), msg);

      /* Keep at most three toasts on screen. */
      while (Toast.container.children.length >= 3) {
        Toast.container.removeChild(Toast.container.firstChild);
      }
      Toast.container.appendChild(t);

      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
      }, Toast.DURATION);
    }
  };

  LUDO.Toast = Toast;
})();
