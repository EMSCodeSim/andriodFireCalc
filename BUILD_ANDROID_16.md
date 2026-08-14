# FireOps Calc Android 16 / API 36 update

This repository is now the dedicated Android source for the FireOps Calc Google Play app.

## Source history

The user-provided 84.apk / 84.aab confirmed the original Play identity and older build metadata. The later Android-capable source in `EMSCodeSim/pump` was newer and had already advanced to version `93` / `9.1.3` while still targeting API 35. That newer project was used as the functional baseline for this rebuild.

## Current rebuild

- Application ID: `com.fireopscalc.app` (unchanged)
- Version code: `94`
- Version name: `9.1.4`
- Compile SDK: `36`
- Target SDK: `36`
- Minimum SDK: `24`
- Capacitor: `8.5.0`
- Cordova purchase plugin: `13.13.1`
- Java: `21`

The GitHub Actions rebuild successfully generated a release Android App Bundle after migrating to Capacitor 8 and Java 21.

## Build steps

Requirements:

- Node.js 22+
- JDK 21
- Android Studio / Android SDK with API 36 installed
- Android SDK Build Tools 36.x
- Google Play upload signing key accepted by the current FireOps Calc listing

From this project directory:

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

## Command-line validation

```bash
cd android
./gradlew bundleRelease
```

A successful unsigned release AAB confirms the source compiles. Google Play upload still requires the accepted upload signing key.

## Signing safety

Do not change the application ID. The release must remain `com.fireopscalc.app`. If the upload key is unavailable and Play App Signing is enabled, reset the upload key through Play Console rather than creating a new app listing.

## Android 16 UI

Android 16 uses edge-to-edge behavior. Test the calculator on an API 36 device/emulator to confirm controls are not covered by status/navigation bars or display cutouts before production rollout.
