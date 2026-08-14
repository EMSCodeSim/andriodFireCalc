# FireOps Calc — Android

Dedicated Android source for the FireOps Calc Google Play app.

## Play identity

- Application ID: `com.fireopscalc.app`
- Current recovered Play build: `84` / `9.0.4`
- Next maintenance build: `85` / `9.0.5`
- Compile SDK: `36`
- Target SDK: `36` (Android 16)
- Minimum SDK: `24`
- Capacitor: `8.5.0`

This repository is intentionally separate from the public FireOps Calc website so Android releases can be maintained without website changes becoming mixed into the app.

## Setup

```bash
npm install
npm run android:add
npm run android:verify
npm run android:open
```

If the `android/` directory already exists, use `npm run android:sync` instead of `npm run android:add`.

See `BUILD_ANDROID_16.md` for Play Store build and signing notes.

## Important

Do not change `com.fireopscalc.app`. A Play Store update must keep the existing application ID and use the upload key accepted by the current Google Play listing.
