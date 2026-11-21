/* ===== Notenweg · App-Hülle: Offline (Service Worker), Update-Hinweis, Tageswechsel, Installations-Tipp =====
   Neue Versionen werden angeboten, nie erzwungen. Vor dem Neuladen wird der Fortschritt gesichert. */
window.NW_SHELL = (() => {
  let reg = null, offered = false, day = null, reloading = false;
  const isStandalone = () => window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);

  function offerUpdate() {
    if (offered) return; offered = true;
    const hb = document.querySelector('.hintbar'); if (hb) hb.remove();
    const el = document.createElement('div');
    el.className = 'updbar'; el.id = 'updbar'; el.setAttribute('role', 'status');
    el.innerHTML = '<span class="ut"><b>Neue Version bereit</b><small>Dein Fortschritt bleibt erhalten.</small></span><button class="btn sm" data-u="go">Aktualisieren</button><button class="iconbtn" data-u="later" aria-label="Später">×</button>';
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-u]'); if (!b) return;
      if (b.dataset.u === 'later') { el.remove(); return; }
      b.disabled = true; b.textContent = 'Lädt …';
      Promise.resolve(typeof flush === 'function' ? flush() : null).catch(() => { }).then(() => {
        if (reg && reg.waiting) reg.waiting.postMessage('skipWaiting');
        else location.reload();
        setTimeout(() => { if (!reloading) location.reload(); }, 2500);
      });
    });
    document.body.appendChild(el);
  }

  function watch(r) {
    reg = r;
    if (r.waiting && navigator.serviceWorker.controller) offerUpdate();
    r.addEventListener('updatefound', () => {
      const w = r.installing; if (!w) return;
      w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(); });
    });
  }

  function installHint() {
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!ios || isStandalone()) return;
    try { if (localStorage.getItem('notenweg-hint-x')) return; } catch (e) { }
    const el = document.createElement('div');
    el.className = 'hintbar';
    el.innerHTML = '<span class="ut"><b>Als App installieren</b><small>Tippe auf <b>Teilen</b> → <b>Zum Home-Bildschirm</b>. Dann startet Notenweg mit eigenem Icon, läuft offline und speichert deinen Fortschritt sicher.</small></span><button class="iconbtn" aria-label="Ausblenden">×</button>';
    el.querySelector('button').addEventListener('click', () => { el.remove(); try { localStorage.setItem('notenweg-hint-x', '1'); } catch (e) { } });
    document.body.appendChild(el);
  }

  function start() {
    day = today();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      if (today() !== day) { day = today(); try { APP.route(); } catch (e) { } }
      if (reg) reg.update().catch(() => { });
    });
    // Tageswechsel auch bei offener App (z. B. Üben über Mitternacht)
    setInterval(() => { if (!document.hidden && today() !== day) { day = today(); if (!document.querySelector('input:focus, textarea:focus') && !(typeof QZ !== 'undefined' && QZ.run)) { try { APP.route(); } catch (e) { } } } }, 60000);
    // Kein Zoom per Zwei-Finger-Geste (iOS ignoriert sonst user-scalable)
    document.addEventListener('gesturestart', e => e.preventDefault());
    installHint();
    if (!('serviceWorker' in navigator)) return;
    const ok = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!ok) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading || !offered) return; reloading = true; location.reload(); });
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(watch).catch(() => { });
  }
  return { start, offerUpdate, isStandalone };
})();
