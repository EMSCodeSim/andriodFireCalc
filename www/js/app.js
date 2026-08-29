// app.js — PRODUCTION (Option A: FULL APP BLOCK AFTER 5 DAYS)
// Dedicated legacy Android shell. Keep this source independent from the website/Flutter app.

const BUILD_V = '20260829-legacy-stability';
const LEGACY_VERSION = '9.1.4';
const LEGACY_BUILD = '94';
const modulePath = (name) => `./${name}.js?v=${BUILD_V}`;

const app = document.getElementById('app');
const buttons = Array.from(document.querySelectorAll('.navbtn'));
let currentView = null;

// Native app detection (Capacitor / Cordova)
function isNativeApp() {
  try {
    if (window?.cordova || window?.phonegap || window?.PhoneGap) return true;
    if (window?.Capacitor?.isNativePlatform) return !!window.Capacitor.isNativePlatform();
    const p = window?.Capacitor?.getPlatform?.();
    if (p && p !== 'web') return true;
  } catch {}
  const proto = (window?.location?.protocol || '').toLowerCase();
  return proto === 'file:' || proto === 'capacitor:' || proto === 'ionic:';
}

/**
 * Android 16 edge-to-edge safety.
 * This deliberately changes spacing only; it does not redesign the legacy UI.
 */
function installSafeAreaGuards() {
  if (!isNativeApp() || document.getElementById('fireops-safe-area-guards')) return;
  const style = document.createElement('style');
  style.id = 'fireops-safe-area-guards';
  style.textContent = `
    .shell {
      padding-top: calc(12px + env(safe-area-inset-top, 0px)) !important;
      padding-left: calc(12px + env(safe-area-inset-left, 0px)) !important;
      padding-right: calc(12px + env(safe-area-inset-right, 0px)) !important;
      padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)) !important;
    }
    .bottom-nav {
      padding-left: calc(14px + env(safe-area-inset-left, 0px)) !important;
      padding-right: calc(14px + env(safe-area-inset-right, 0px)) !important;
      padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important;
    }
    #aboutSheet, #chartsSheet {
      padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)) !important;
    }
    @media (min-width: 768px) {
      .shell {
        padding-top: calc(16px + env(safe-area-inset-top, 0px)) !important;
        padding-left: calc(16px + env(safe-area-inset-left, 0px)) !important;
        padding-right: calc(16px + env(safe-area-inset-right, 0px)) !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function installVersionIndicator() {
  const aboutBody = document.getElementById('aboutBody');
  if (!aboutBody || document.getElementById('fireops-version-indicator')) return;
  const el = document.createElement('div');
  el.id = 'fireops-version-indicator';
  el.textContent = `FireOps Calc ${LEGACY_VERSION} • Build ${LEGACY_BUILD}`;
  el.style.cssText = 'margin:0 0 10px;padding:7px 10px;border:1px solid #1c2940;border-radius:10px;background:#050913;color:#cfe4ff;font-size:12px;text-align:center;';
  aboutBody.prepend(el);
}

/**
 * ANDROID "STUCK OLD UI" FIX:
 * Remove any stale Service Worker / CacheStorage left by historical web-wrapper builds.
 */
async function purgeServiceWorkerAndCachesOnNative() {
  if (!isNativeApp()) return;
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister().catch(() => {})));
    }
  } catch {}
  try {
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k).catch(() => {})));
    }
  } catch {}
}

// Lazy load paywall module (native only)
let _paywallMod = null;
async function getPaywall() {
  if (!isNativeApp()) return null;
  if (_paywallMod) return _paywallMod;
  _paywallMod = await import(modulePath('paywall'));
  return _paywallMod;
}

// Top quick-action row (Department Setup button)
const topActionsEl = document.querySelector('.top-actions');
function updateTopActionsVisibility(viewName) {
  if (!topActionsEl) return;
  topActionsEl.style.display = (viewName === 'calc') ? 'flex' : 'none';
}

// View loaders
const loaders = {
  calc:     () => import(modulePath('view.calc')),
  practice: () => import(modulePath('view.practice')),
  charts:   () => import(modulePath('view.charts')),
  settings: () => import(modulePath('view.settings')),
};

// Charts overlay
let chartsOverlay = document.getElementById('chartsOverlay');
let chartsMount = document.getElementById('chartsMount');
let chartsClose = document.getElementById('closeCharts');
let chartsDispose = null;

async function openCharts() {
  if (!chartsOverlay) return;
  if (topActionsEl) topActionsEl.style.display = 'none';
  chartsOverlay.style.display = 'block';

  if (chartsMount) chartsMount.innerHTML = '<div style="opacity:.7;padding:12px">Loading charts…</div>';

  try {
    const mod = await loaders.charts();
    const res = await mod.render(chartsMount);
    chartsDispose = res?.dispose || null;
  } catch (err) {
    if (chartsMount) chartsMount.innerHTML = '<div class="card">Failed to load charts: ' + String(err) + '</div>';
  }
}

function closeCharts() {
  if (chartsDispose) { try { chartsDispose(); } catch {} chartsDispose = null; }
  if (chartsMount) chartsMount.innerHTML = '';
  if (chartsOverlay) chartsOverlay.style.display = 'none';
  updateTopActionsVisibility(currentView?.name || 'calc');
}

if (chartsClose) chartsClose.addEventListener('click', closeCharts);
if (chartsOverlay) chartsOverlay.addEventListener('click', (e) => { if (e.target === chartsOverlay) closeCharts(); });

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
  ]);
}

// -------------------- FULL APP GATE (PRODUCTION) --------------------
let _blocked = false;

function renderTrialEndedScreen() {
  if (!app) return;
  app.innerHTML = `
    <div style="padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;">
      <div style="max-width:640px;margin:0 auto;">
        <div style="font-size:22px;font-weight:900;margin-bottom:8px;">Trial Ended</div>
        <div style="opacity:.9;line-height:1.45;margin-bottom:14px;">
          Your 5-day free trial has ended. Upgrade to Pro to continue using FireOps Calc.
        </div>
        <div style="opacity:.75;font-size:12px;">
          Use Buy Pro / Restore in the popup.
        </div>
      </div>
    </div>
  `;
}

function disableNav() {
  buttons.forEach(b => { try { b.disabled = true; b.style.pointerEvents = 'none'; } catch {} });
  if (topActionsEl) topActionsEl.style.display = 'none';
}

function enableNav() {
  buttons.forEach(b => { try { b.disabled = false; b.style.pointerEvents = ''; } catch {} });
  updateTopActionsVisibility(currentView?.name || 'calc');
}

async function enforceProductionGate() {
  if (!isNativeApp()) return true;

  const pw = await getPaywall();
  if (!pw) return true;

  // Always init billing silently so owned users unlock immediately.
  try { await pw.initBilling?.(); } catch {}

  if (pw.hardBlocked?.()) {
    _blocked = true;
    renderTrialEndedScreen();
    disableNav();
    try { pw.showPaywallModal?.(); } catch {}
    return false;
  }

  _blocked = false;
  enableNav();
  return true;
}

// On unlock: hide paywall + load calc (NO reload loop)
window.addEventListener('fireops:pro_unlocked', async () => {
  const pw = await getPaywall();
  try { pw?.hidePaywallModal?.(); } catch {}

  _blocked = false;
  enableNav();

  try {
    await setView('calc');
  } catch {
    // Last-resort single reload if something is half-mounted.
    try { window.location.reload(); } catch {}
  }
});

// -------------------- Normal view switching --------------------
async function setView(name) {
  if (_blocked) return;

  const load = loaders[name];
  if (!load) throw new Error(`Unknown view "${name}"`);

  if (currentView?.dispose) { try { currentView.dispose(); } catch {} }

  updateTopActionsVisibility(name);
  if (app) app.innerHTML = '<div style="opacity:.7;padding:12px">Loading…</div>';

  const mod = await withTimeout(load(), 8000, `Load view "${name}"`);
  if (!mod?.render) throw new Error(`View "${name}" did not export render()`);

  const view = await withTimeout(mod.render(app), 8000, `Render view "${name}"`);
  currentView = { name, dispose: view?.dispose };

  buttons.forEach(b => b.classList.toggle('active', b.dataset.view === name));
  updateTopActionsVisibility(name);
}

buttons.forEach(b => b.addEventListener('click', () => {
  if (_blocked) return;

  const v = b.dataset.view;
  if (v === 'charts') { openCharts(); return; }

  // Preserve existing behavior: returning from practice remounts the calculator cleanly.
  if (v === 'calc' && currentView?.name === 'practice') {
    window.location.reload();
    return;
  }

  setView(v);
}));

/**
 * Synchronous Android Back contract used by MainActivity.
 * Return true when the app consumed the Back press; return false to let Android exit.
 */
function handleAndroidBack() {
  try {
    const editorHost = document.getElementById('stageOverlayHost');
    if (editorHost && editorHost.style.display !== 'none' && window.BottomSheetEditor?.close) {
      window.BottomSheetEditor.close();
      return true;
    }

    const quickStart = document.getElementById('quickStartModal');
    if (quickStart && !quickStart.classList.contains('hidden')) {
      document.getElementById('qsCloseBtn')?.click();
      return true;
    }

    const about = document.getElementById('aboutOverlay');
    if (about && about.style.display === 'block') {
      document.getElementById('closeAbout')?.click();
      return true;
    }

    if (chartsOverlay && chartsOverlay.style.display === 'block') {
      closeCharts();
      return true;
    }

    if (!_blocked && currentView?.name && currentView.name !== 'calc') {
      setView('calc').catch(() => { try { window.location.reload(); } catch {} });
      return true;
    }
  } catch (err) {
    console.warn('Android Back handling failed', err);
  }

  // Already at the main Pump screen: allow Android to exit normally.
  return false;
}

window.fireopsHandleAndroidBack = handleAndroidBack;

// Cordova-compatible fallback for older WebView behavior.
document.addEventListener('backbutton', (event) => {
  if (handleAndroidBack()) {
    try { event.preventDefault(); } catch {}
  }
}, false);

// Boot
(async () => {
  installSafeAreaGuards();
  installVersionIndicator();

  // Prevent Android WebView from serving old cached UI.
  await purgeServiceWorkerAndCachesOnNative();

  const ok = await enforceProductionGate();
  if (!ok) return;

  await setView('calc');
  updateTopActionsVisibility('calc');
})();
