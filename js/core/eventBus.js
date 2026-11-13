/* ============================================================
 * Ludo Master - core/eventBus.js
 * Tiny pub/sub that decouples game logic from the UI layer.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};
  const handlers = {};

  function on(evt, fn) {
    (handlers[evt] = handlers[evt] || []).push(fn);
    return function unsubscribe() { off(evt, fn); };
  }

  function once(evt, fn) {
    const unsubscribe = on(evt, function (data) { unsubscribe(); fn(data); });
    return unsubscribe;
  }

  function off(evt, fn) {
    const list = handlers[evt] || [];
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  }

  function emit(evt, data) {
    (handlers[evt] || []).slice().forEach((fn) => {
      try { fn(data); } catch (err) {
        if (LUDO.Log) LUDO.Log.error('Bus handler failed for ' + evt, err);
      }
    });
    /* Wildcard listeners receive every event. */
    (handlers['*'] || []).slice().forEach((fn) => {
      try { fn(evt, data); } catch (e) { /* ignore */ }
    });
  }

  LUDO.Bus = { on, once, off, emit };
})();
