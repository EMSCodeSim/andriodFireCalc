# FireOps Calc Android 16 / API 36 update

This repository is the Android-only recovery/migration of the FireOps Calc Play app.

## Existing Play build recovered from 84.apk

- Application ID: `com.fireopscalc.app`
- Version code: `84`
- Version name: `9.0.4`
- Compile SDK: `35`
- Target SDK: `35`
- Minimum SDK: `23`

## Maintenance update baseline

- Application ID: `com.fireopscalc.app` (unchanged)
- Version code: `85`
- Version name: `9.0.5`
- Compile SDK: `36`
- Target SDK: `36`
- Minimum SDK: `24`
- Capacitor: `8.5.0`
- Cordova purchase plugin: `13.13.1`

Capacitor 8 targets Android 16 / API 36 and requires Android API 24 or newer.

## Build steps

Requirements:

- Node.js 22+
- Android Studio with Android 16 SDK / API 36 installed
- Android SDK Build Tools 36.x
- JDK 17+ (JDK 21 recommended)
- Google Play upload signing key accepted by the current FireOps Calc listing

From this project directory:

```bash
npm install
npm run android:add
npm run android:verify
npm run android:open
```

If `android/` already exists:

```bash
npm install
npm run android:sync
npm run android:verify
npm run android:open
```

In Android Studio:

1. Let Gradle finish syncing.
2. Test a debug build on Android 16.
3. Test calculator, Department Setup, presets, practice mode, offline startup, and purchase/restore flows.
4. Build > Generate Signed App Bundle / APK > Android App Bundle.
5. Sign the AAB using the upload key accepted by the existing Google Play listing.
6. Upload to Internal Testing before Production.

## Signing safety

Do not change the application ID. The release must remain `com.fireopscalc.app`. If the upload key is unavailable and Play App Signing is enabled, reset the upload key through Play Console rather than creating a new app listing.

## Android 16 UI

Android 16 uses edge-to-edge behavior. Preserve safe-area handling so calculator controls are not covered by system bars or display cutouts.
