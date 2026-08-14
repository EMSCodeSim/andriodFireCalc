import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const variablesPath = path.join(root, 'android', 'variables.gradle');
const appGradlePath = path.join(root, 'android', 'app', 'build.gradle');
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(variablesPath) || !fs.existsSync(appGradlePath)) {
  fail('Android platform is missing. Run npm run android:add first.');
}

let variables = fs.readFileSync(variablesPath, 'utf8');
variables = variables
  .replace(/minSdkVersion\s*=\s*\d+/, 'minSdkVersion = 24')
  .replace(/compileSdkVersion\s*=\s*\d+(?:\.\d+)?/, 'compileSdkVersion = 36')
  .replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 36');
fs.writeFileSync(variablesPath, variables);

let gradle = fs.readFileSync(appGradlePath, 'utf8');
gradle = gradle
  .replace(/namespace\s*(?:=\s*)?["'][^"']+["']/, 'namespace "com.fireopscalc.app"')
  .replace(/applicationId\s+["'][^"']+["']/, 'applicationId "com.fireopscalc.app"')
  .replace(/versionCode\s+\d+/, 'versionCode 94')
  .replace(/versionName\s+["'][^"']+["']/, 'versionName "9.1.4"');
fs.writeFileSync(appGradlePath, gradle);

if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('com.android.vending.BILLING')) {
    manifest = manifest.replace(
      /<manifest([^>]*)>/,
      '<manifest$1>\n    <uses-permission android:name="com.android.vending.BILLING" />'
    );
    fs.writeFileSync(manifestPath, manifest);
  }
}

console.log('FireOps Calc Android settings enforced:');
console.log('  applicationId: com.fireopscalc.app');
console.log('  versionCode: 94');
console.log('  versionName: 9.1.4');
console.log('  minSdk: 24');
console.log('  compileSdk: 36');
console.log('  targetSdk: 36');
