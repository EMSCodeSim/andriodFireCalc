// Android-only FireOps Calc entry point.
// This intentionally mounts only the legacy visual pump calculator.

const app = document.getElementById('app');
const deptSetupButton = document.getElementById('departmentSetup');
let paywallModule = null;
let calculatorDispose = null;

function isNativeApp() {
  try {
    if (window?.cordova || window?.phonegap || window?.PhoneGap) return true;
    if (window?.Capacitor?.isNativePlatform) return !!window.Capacitor.isNativePlatform();
    const platform = window?.Capacitor?.getPlatform?.();
    if (platform && platform !== 'web') return true;
  } catch (_) {}

  const protocol = (window?.location?.protocol || '').toLowerCase();
  return protocol === 'file:' || protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'https:';
}

async function purgeLegacyWebCaches() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister().catch(() => {})));
    }
  } catch (_) {}

  try {
    if (window.caches?.keys) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key).catch(() => {})));
    }
  } catch (_) {}
}

async function getPaywall() {
  if (!isNativeApp()) return null;
  if (paywallModule) return paywallModule;
  paywallModule = await import('./paywall.js');
  return paywallModule;
}

function renderTrialEnded() {
  if (!app) return;
  app.innerHTML = `
    <section class="gate-card" role="status">
      <h1>Trial Ended</h1>
      <p>Your 5-day free trial has ended. Upgrade to Pro to continue using FireOps Calc.</p>
      <p class="gate-note">Use Buy Pro or Restore in the purchase window.</p>
    </section>
  `;
  if (deptSetupButton) deptSetupButton.hidden = true;
}

async function enforcePurchaseGate() {
  const paywall = await getPaywall();
  if (!paywall) return true;

  try {
    await paywall.initBilling?.();
  } catch (_) {}

  if (paywall.hardBlocked?.()) {
    renderTrialEnded();
    try { paywall.showPaywallModal?.(); } catch (_) {}
    return false;
  }

  return true;
}

async function mountCalculator() {
  if (!app) return;

  if (calculatorDispose) {
    try { calculatorDispose(); } catch (_) {}
    calculatorDispose = null;
  }

  app.innerHTML = '<div class="loading-card">Loading calculator…</div>';

  try {
    const calculator = await import('./view.calc.js');
    if (typeof calculator.render !== 'function') throw new Error('Calculator renderer is unavailable.');
    const mounted = await calculator.render(app);
    calculatorDispose = mounted?.dispose || null;
    if (deptSetupButton) deptSetupButton.hidden = false;
  } catch (error) {
    console.error('Failed to load FireOps Calc visual calculator', error);
    app.innerHTML = `
      <section class="gate-card" role="alert">
        <h1>Calculator could not load</h1>
        <p>Close and reopen FireOps Calc. If the problem continues, reinstall the current Android release.</p>
      </section>
    `;
  }
}

function openDepartmentSetup() {
  try {
    if (typeof window.fireopsOpenDeptSetup === 'function') {
      window.fireopsOpenDeptSetup();
    }
  } catch (error) {
    console.warn('Department Setup could not open', error);
  }
}

if (deptSetupButton) deptSetupButton.addEventListener('click', openDepartmentSetup);

window.addEventListener('fireops:pro_unlocked', async () => {
  const paywall = await getPaywall();
  try { paywall?.hidePaywallModal?.(); } catch (_) {}
  await mountCalculator();
});

(async function bootAndroidCalculator() {
  await purgeLegacyWebCaches();
  const allowed = await enforcePurchaseGate();
  if (!allowed) return;
  await mountCalculator();
})();
