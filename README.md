# FireOps Calc — Android

Dedicated Android source for the FireOps Calc Google Play app, separated from the public FireOps Calc website.

## Current Android release baseline

- Application ID: `com.fireopscalc.app`
- Version code: `94`
- Version name: `9.1.4`
- Compile SDK: `36`
- Target SDK: `36` (Android 16)
- Minimum SDK: `24`
- Capacitor: `8.5.0`
- Cordova purchase plugin: `13.13.1`

The Android project and packaged web bundle were rebuilt from the latest Android-capable source in `EMSCodeSim/pump`, where the previous native build was version `93` / `9.1.3` targeting API 35.

## Repository layout

- `www/` — FireOps Calc web bundle packaged into the Android app
- `android/` — native Capacitor Android project
- `scripts/` — API 36/version enforcement and verification
- `.github/workflows/bootstrap-from-pump.yml` — reproducible migration/build workflow

## Setup

Requirements include Node.js 22+, JDK 21, and Android SDK/API 36.

```bash
npm install
npm run android:sync
npm run android:verify
npm run android:open
```

The existing `android/` project is committed, so normally use `android:sync`. Use `android:add` only if intentionally regenerating the Android platform from scratch.

## Play Store safety

Do not change `com.fireopscalc.app`. A Play Store update must keep the existing application ID and must be signed with an upload key accepted by the current Google Play listing.

See `BUILD_ANDROID_16.md` for build/signing details.
