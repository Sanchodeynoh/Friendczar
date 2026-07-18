# Packaging Friendczar for the Play Store

Requires a computer (Windows/Mac/Linux) — this cannot be done from a phone.

## What you need installed first

1. **Node.js** (18+) — nodejs.org
2. **Android Studio** — developer.android.com/studio (this also installs the Android SDK you need)
3. **A Google Play Developer account** — play.google.com/console, one-time $25 fee

## Step 1 — Get the code onto your computer

Either:
- `git clone https://github.com/Sanchodeynoh/friendczar-frontend.git` (or whatever you named the repo), or
- Download the repo as a ZIP from GitHub (Code → Download ZIP) and unzip it

Open a terminal in that folder.

## Step 2 — Install everything and build the web app

```bash
npm install
npm run build
```
This creates a `dist/` folder — the same production build that's currently live on GitHub Pages.

## Step 3 — Add the Android project

```bash
npx cap add android
npx cap sync android
```
This generates a full native Android Studio project inside an `android/` folder, and copies your built web app into it.

## Step 4 — Enable camera/microphone (required for calls + live streaming)

Capacitor's default Android project doesn't automatically allow camera/mic access inside the app's WebView — without this step, calls and live streaming will silently fail to get camera/mic access once packaged.

1. Open `android/app/src/main/java/net/friendczar/app/MainActivity.java`
2. Replace its entire contents with the code from `docs/MainActivity-reference.java` in this project (I've included it as a ready-to-paste reference)
3. Open `android/app/src/main/AndroidManifest.xml` and add these two lines inside the `<manifest>` tag, alongside the existing `<uses-permission>` entries:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   ```

## Step 5 — Update your backend's CORS setting

Your Render backend currently only allows requests from your website's domain. The packaged Android app makes requests from a different origin. On Render, update your `CORS_ORIGIN` environment variable to include it:
```
https://friendczar.net,capacitor://localhost,https://localhost
```

## Step 6 — Open it in Android Studio and run it once

```bash
npx cap open android
```
This launches Android Studio with the project. Let Gradle finish syncing (can take a few minutes the first time), then press the green ▶ Run button with an emulator or your own Android phone connected via USB (with Developer Mode + USB debugging turned on) to test it actually works before submitting anywhere.

## Step 7 — App icon and splash screen

Right now it'll use Capacitor's default icon. Replace these before publishing:
- Icons and splash images go in `android/app/src/main/res/` (multiple folders for different screen densities — Android Studio's **Image Asset Studio**, under `res` → right-click → New → Image Asset, makes this easy: just feed it one high-res logo and it generates all the sizes)

## Step 8 — Generate a signed release build

In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**

You'll be prompted to create a new **keystore** — this is a file + password that cryptographically signs your app.

**This is the single most important file in this whole process: back it up somewhere safe (password manager, encrypted drive, etc.) and never lose it.** If you lose it, you cannot publish updates to the same app listing ever again — you'd have to publish as a brand new app and lose all your reviews/installs.

This produces a `.aab` file — that's what you upload to Play Console, not an `.apk`.

## Step 9 — Google Play Console setup

1. Create a new app in Play Console
2. Fill out the **Store listing**: app name, description, screenshots (take these from your phone using the emulator or a real device), feature graphic
3. Complete the **Content rating questionnaire** — be honest about it being a dating app with user-generated content and messaging
4. Complete the **Data Safety form** — declare what data you collect (email, photos, location if you add it, messages) and how it's used
5. Set up a **Privacy Policy** page (a simple one on your website is fine) and link it — Play requires this for any app handling personal data, which yours does
6. Under **App content**, declare it as a dating/social app — Google reviews these more carefully than average, expect the first review to take longer than a typical app
7. Upload your `.aab` under **Production → Create release**
8. Submit for review

## A few things worth knowing

- **First submission review can take days**, sometimes longer for dating apps specifically. Don't expect same-day approval.
- **Google Play requires visible moderation/safety measures** for dating apps — you already have reporting and an admin moderation queue, which covers a lot of this. A **block user** feature (not just report) is something Play reviewers commonly expect too — I can build that if you want it before submitting.
- **Every time you want to update the app**, you repeat steps 2–3 and 8 (rebuild, resync, re-sign with the *same* keystore, upload a new `.aab` with a higher version number in `capacitor.config.json`/Android's `build.gradle`).
