import fs from 'node:fs';

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`missing ${file}`);
  }
  return fs.readFileSync(file, 'utf8');
}

const failures = [];
function pass(label) { console.log(`PASS: ${label}`); }
function fail(label) { console.error(`FAIL: ${label}`); failures.push(label); }
function expect(label, condition) { condition ? pass(label) : fail(label); }

let variables = '';
let gradle = '';
let manifest = '';
let capacitorGradle = '';
let capacitorConfig = '';
let packageJson = null;
let indexHtml = '';
let calculatorHtml = '';
let appJs = '';
let mainActivity = '';
let workflow = '';

try { variables = read('android/variables.gradle'); } catch (e) { fail(e.message); }
try { gradle = read('android/app/build.gradle'); } catch (e) { fail(e.message); }
try { manifest = read('android/app/src/main/AndroidManifest.xml'); } catch (e) { fail(e.message); }
try { capacitorGradle = read('android/app/capacitor.build.gradle'); } catch (e) { fail(e.message); }
try { capacitorConfig = read('capacitor.config.json'); } catch (e) { fail(e.message); }
try { packageJson = JSON.parse(read('package.json')); } catch (e) { fail(`package.json readable JSON: ${e.message}`); }
try { indexHtml = read('www/index.html'); } catch (e) { fail(e.message); }
try { calculatorHtml = read('www/calculator.html'); } catch (e) { fail(e.message); }
try { appJs = read('www/js/app.js'); } catch (e) { fail(e.message); }
try { mainActivity = read('android/app/src/main/java/com/fireopscalc/app/MainActivity.java'); } catch (e) { fail(e.message); }
try { workflow = read('.github/workflows/bootstrap-from-pump.yml'); } catch (e) { fail(e.message); }

expect('compileSdkVersion = 36', /compileSdkVersion\s*=\s*36/.test(variables));
expect('targetSdkVersion = 36', /targetSdkVersion\s*=\s*36/.test(variables));
expect('minSdkVersion = 24', /minSdkVersion\s*=\s*24/.test(variables));

expect('applicationId remains com.fireopscalc.app', /applicationId\s+["']com\.fireopscalc\.app["']/.test(gradle));
expect('namespace remains com.fireopscalc.app', /namespace\s*(?:=\s*)?["']com\.fireopscalc\.app["']/.test(gradle));

const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);
const versionCode = versionCodeMatch ? Number(versionCodeMatch[1]) : NaN;
expect('versionCode is at least 94 and above published v84', Number.isFinite(versionCode) && versionCode >= 94 && versionCode > 84);
expect('versionName is 9.1.4', /versionName\s+["']9\.1\.4["']/.test(gradle));

expect('Google Play billing permission present', /com\.android\.vending\.BILLING/.test(manifest));
const billingMatch = capacitorGradle.match(/com\.android\.billingclient:billing:([0-9]+(?:\.[0-9]+){1,2})/);
const billingMajor = billingMatch ? Number(billingMatch[1].split('.')[0]) : NaN;
expect('Google Play Billing Library is version 8 or newer', Number.isFinite(billingMajor) && billingMajor >= 8);

expect('Capacitor appId remains com.fireopscalc.app', /"appId"\s*:\s*"com\.fireopscalc\.app"/.test(capacitorConfig));
expect('package version matches 9.1.4', packageJson?.version === '9.1.4');
expect('Capacitor Android remains 8.5.0', packageJson?.dependencies?.['@capacitor/android'] === '8.5.0');
expect('purchase plugin remains configured', !!packageJson?.dependencies?.['cordova-plugin-purchase']);

expect('legacy app launches directly into calculator', /window\.location\.replace\(['"]calculator\.html['"]\)/.test(indexHtml));
expect('legacy calculator source is present', calculatorHtml.includes('<main id="app"'));

const trackerPattern = /googlesyndication\.com|googletagmanager\.com|gtag\s*\(\s*["']config["']/i;
expect('native calculator has no AdSense/Google Analytics loaders', !trackerPattern.test(calculatorHtml));
expect('main router has no ad-render dependency', !/ads-guards\.js|renderAdOnce|ADS_CLIENT/.test(appJs));

expect('Android 16 safe-area guard is installed', /safe-area-inset-top/.test(appJs) && /safe-area-inset-bottom/.test(appJs));
expect('About screen includes build/version indicator logic', /FireOps Calc \$\{LEGACY_VERSION\}.*Build \$\{LEGACY_BUILD\}/s.test(appJs));
expect('web UI exposes Android Back handler', /fireopsHandleAndroidBack/.test(appJs));
expect('MainActivity delegates Android Back to legacy UI', /fireopsHandleAndroidBack/.test(mainActivity));
expect('hydraulic regression test file exists', fs.existsSync('tests/hydraulics-regression.mjs'));

// Strip YAML comment-only lines before checking source independence so the
// explanatory comment that says "do NOT clone" does not trip the guard.
const workflowExecutable = workflow.replace(/^\s*#.*$/gm, '');
expect('legacy build does not clone another repository', !/\bgit\s+clone\b/.test(workflowExecutable));
expect('legacy build does not depend on EMSCodeSim/pump', !/EMSCodeSim\/pump/.test(workflowExecutable));
expect('legacy build uses read-only contents permission', /permissions:\s*\n\s*contents:\s*read/.test(workflow));

if (failures.length) {
  console.error(`\n${failures.length} legacy release guard check(s) failed.`);
  process.exit(1);
}

console.log(`\nPASS: FireOps Calc legacy Android project is release-guarded for API 36 / versionCode ${versionCode}.`);
