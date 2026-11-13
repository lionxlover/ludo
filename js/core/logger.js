/* ============================================================
 * Ludo Master - core/logger.js
 * Leveled logging with an in-memory history buffer.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };
  let level = LEVELS.info;
  const history = [];
  const MAX_HISTORY = 250;

  function log(lvl, msg, data) {
    if (LEVELS[lvl] == null) lvl = 'info';
    history.push({ t: Date.now(), lvl, msg, data });
    if (history.length > MAX_HISTORY) history.shift();
    if (LEVELS[lvl] < level) return;
    const fn = lvl === 'error' ? 'error' : (lvl === 'warn' ? 'warn' : 'log');
    try { console[fn]('[LUDO:' + lvl + '] ' + msg, data != null ? data : ''); } catch (e) { /* ignore */ }
  }

  LUDO.Log = {
    setLevel(name) { if (LEVELS[name] != null) level = LEVELS[name]; },
    debug(msg, data) { log('debug', msg, data); },
    info(msg, data) { log('info', msg, data); },
    warn(msg, data) { log('warn', msg, data); },
    error(msg, data) { log('error', msg, data); },
    history,
    dump() { return history.slice(); }
  };
})();
