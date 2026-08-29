import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve('android/app/src/main/assets/public');
const indexPath = path.join(publicDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  throw new Error('Android public/index.html is missing. Run npm run android:sync first.');
}

const index = fs.readFileSync(indexPath, 'utf8');
const requiredMarkers = [
  'Android visual pump calculator',
  'js/android-main.js',
  'id="app"',
];

for (const marker of requiredMarkers) {
  if (!index.includes(marker)) {
    throw new Error(`Android calculator shell is missing required marker: ${marker}`);
  }
}

const forbiddenMarkers = [
  'googletagmanager.com',
  'pagead2.googlesyndication.com',
  'Fire Pump Calculator & Engineer Training Tools',
  'scenario-player.html',
  'View All Tools',
];

for (const marker of forbiddenMarkers) {
  if (index.includes(marker)) {
    throw new Error(`Website content leaked into Android index.html: ${marker}`);
  }
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.toLowerCase().endsWith('.html')) {
      htmlFiles.push(path.relative(publicDir, absolute).replaceAll('\\', '/'));
    }
  }
}
walk(publicDir);

if (htmlFiles.length !== 1 || htmlFiles[0] !== 'index.html') {
  throw new Error(`Expected one packaged HTML file (index.html), found: ${htmlFiles.join(', ')}`);
}

for (const required of [
  'assets/engine181.png',
  'ccs/mobile-friendly.css',
  'js/android-main.js',
  'js/view.calc.js',
  'js/calcShared.js',
  'js/store.js',
  'js/waterSupply.js',
  'js/preset.js',
  'js/paywall.js',
]) {
  if (!fs.existsSync(path.join(publicDir, required))) {
    throw new Error(`Calculator dependency is missing from packaged Android assets: ${required}`);
  }
}

console.log('Verified: packaged Android UI is visual-calculator-only.');
