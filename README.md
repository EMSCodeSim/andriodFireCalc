# FireOps Calc — Android

Dedicated Android source for the original FireOps Calc visual pump calculator.

This repository is intentionally separate from both:

- the public FireOps Calc website in `EMSCodeSim/pump`
- the remade iOS/App Store version

The Android app should open directly into the legacy visual engine-and-hose calculator and should not expose or package the public website homepage, training hub, SEO pages, scenario navigation, web ads, or website analytics.

## Current Android release baseline

- Application ID: `com.fireopscalc.app`
- Version code: `94`
- Version name: `9.1.4`
- Compile SDK: `36`
- Target SDK: `36` (Android 16)
- Minimum SDK: `24`
- Capacitor: `8.5.0`
- Cordova purchase plugin: `13.13.1`

## Android UI architecture

- `www/index.html` — Android-only calculator shell
- `www/js/android-main.js` — Android boot/purchase-gate entry point
- `www/js/view.calc.js` — original visual calculator
- `www/js/` — calculator dependencies inherited from the legacy implementation
- `scripts/prune-android-bundle.mjs` — removes website pages/assets from Capacitor's packaged Android public directory after every sync
- `scripts/verify-calculator-only.mjs` — fails the build if website HTML or website shell markers leak back into the Android package
- `android/` — native Capacitor Android project

The legacy `www/` source tree still contains some historical web files because calculator modules share code with the earlier implementation. They are source-only. `npm run android:sync` prunes the actual Android package to the calculator shell, calculator JavaScript, calculator CSS, and required local imagery before a release is built.

## Setup

Requirements include Node.js 22+, JDK 21, and Android SDK/API 36.

```bash
npm install
npm run android:sync
npm run android:verify
npm run android:open
```

`android:sync` now performs three steps:

1. Capacitor sync
2. Remove public-website files from the packaged Android assets
3. Enforce Android 16 / API 36 settings

`android:verify` checks both the API level and the calculator-only bundle rules.

## Important separation rule

Do not restore `www/` from `EMSCodeSim/pump` and do not deploy this repository as the FireOps Calc website. Website development belongs in `EMSCodeSim/pump`; Android calculator development belongs here.

## Play Store safety

Do not change `com.fireopscalc.app`. A Play Store update must keep the existing application ID and must be signed with an upload key accepted by the current Google Play listing.

See `BUILD_ANDROID_16.md` for build/signing details.
