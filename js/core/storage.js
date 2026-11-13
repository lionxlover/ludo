/* ============================================================
 * Ludo Master - core/storage.js
 * Safe localStorage wrapper (JSON) with in-memory fallback so
 * the game still runs when storage is blocked (file://, SSR).
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const mem = {};
  let usable = false;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('__ludo_probe__', '1');
      localStorage.removeItem('__ludo_probe__');
      usable = true;
    }
  } catch (e) { usable = false; }

  function get(key, fallback) {
    try {
      const raw = usable ? localStorage.getItem(key) : (mem[key] != null ? mem[key] : null);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function set(key, value) {
    try {
      const raw = JSON.stringify(value);
      if (usable) localStorage.setItem(key, raw); else mem[key] = raw;
      return true;
    } catch (e) { return false; }
  }

  function remove(key) {
    try {
      if (usable) localStorage.removeItem(key); else delete mem[key];
    } catch (e) { /* ignore */ }
  }

  LUDO.Store = { get, set, remove, usable: () => usable };
})();
