#!/usr/bin/env bash
set -euo pipefail
npm install
if [ -f android/app/build.gradle ]; then
  npm run android:sync
else
  npm run android:add
fi
npm run android:verify
echo "FireOps Calc Android API 36 setup complete."
echo "Run: npm run android:open"
