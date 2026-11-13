/* ============================================================
 * Ludo Master - core/utils.js
 * Shared helpers: math, DOM, async, strings.
 * ============================================================ */
(function () {
  'use strict';
  const LUDO = window.LUDO = window.LUDO || {};

  const rawSleep = (ms) => new Promise((res) => setTimeout(res, ms));

  /** Pause-aware sleep: time freezes while LUDO.State.paused is true.
   * Uses few large timer hops so background-tab throttling cannot
   * stretch waits unreasonably. */
  async function sleep(ms) {
    let remaining = ms;
    while (remaining > 0) {
      if (LUDO.State && LUDO.State.paused) {
        await rawSleep(100);
        continue;                     // paused: remaining stays frozen
      }
      const chunk = Math.min(remaining, 200);
      await rawSleep(chunk);
      remaining -= chunk;
    }
    return true;
  }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function rollDice() { return randInt(1, 6); }
  function choice(arr) { return arr[randInt(0, arr.length - 1)]; }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  let uidCounter = 0;
  function uid() { uidCounter += 1; return 'id' + Date.now().toString(36) + '_' + uidCounter; }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  LUDO.Utils = {
    rawSleep, sleep, randInt, rollDice, choice, clamp, deepClone,
    uid, cap, esc, qs, qsa, el
  };
})();
