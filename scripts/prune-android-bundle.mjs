import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve('android/app/src/main/assets/public');

if (!fs.existsSync(publicDir)) {
  throw new Error(`Capacitor public directory not found: ${publicDir}`);
}

const keep = [
  /^index\.html$/,
  /^fireopscalc2\.png$/,
  /^assets\/engine181\.png$/,
  /^ccs\/mobile-friendly\.css$/,
  /^js\/.*\.js$/,
];

function allowed(relativePath) {
  return keep.some((pattern) => pattern.test(relativePath.replaceAll('\\', '/')));
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(publicDir, absolute).replaceAll('\\', '/');

    if (entry.isDirectory()) {
      walk(absolute);
      if (fs.existsSync(absolute) && fs.readdirSync(absolute).length === 0) {
        fs.rmdirSync(absolute);
      }
      continue;
    }

    if (!allowed(relative)) {
      fs.rmSync(absolute, { force: true });
    }
  }
}

walk(publicDir);

const htmlFiles = [];
function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(absolute);
    else if (entry.name.toLowerCase().endsWith('.html')) {
      htmlFiles.push(path.relative(publicDir, absolute).replaceAll('\\', '/'));
    }
  }
}
collectHtml(publicDir);

if (htmlFiles.length !== 1 || htmlFiles[0] !== 'index.html') {
  throw new Error(`Android bundle must contain only index.html; found: ${htmlFiles.join(', ')}`);
}

for (const required of [
  'index.html',
  'fireopscalc2.png',
  'assets/engine181.png',
  'ccs/mobile-friendly.css',
  'js/android-main.js',
  'js/view.calc.js',
  'js/paywall.js',
]) {
  if (!fs.existsSync(path.join(publicDir, required))) {
    throw new Error(`Required Android calculator asset missing after prune: ${required}`);
  }
}

console.log('Android web bundle pruned to the visual calculator only.');
