import fs from 'node:fs';

const checks = [
  ['android/variables.gradle', /compileSdkVersion\s*=\s*36/, 'compileSdkVersion = 36'],
  ['android/variables.gradle', /targetSdkVersion\s*=\s*36/, 'targetSdkVersion = 36'],
  ['android/variables.gradle', /minSdkVersion\s*=\s*24/, 'minSdkVersion = 24'],
  ['android/app/build.gradle', /applicationId\s+["']com\.fireopscalc\.app["']/, 'applicationId com.fireopscalc.app'],
  ['android/app/build.gradle', /versionCode\s+85/, 'versionCode 85'],
  ['android/app/build.gradle', /versionName\s+["']9\.0\.5["']/, 'versionName 9.0.5']
];

let failed = false;
for (const [file, re, label] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`FAIL: missing ${file}`);
    failed = true;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!re.test(text)) {
    console.error(`FAIL: ${label}`);
    failed = true;
  } else {
    console.log(`PASS: ${label}`);
  }
}

if (failed) process.exit(1);
console.log('PASS: FireOps Calc Android project is configured for API 36.');
