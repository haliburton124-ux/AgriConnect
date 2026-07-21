# AgriConnect Mobile

Flutter mobile app for **farmers** on Android (APK) and iOS. Connects to the existing Laravel API — the React web app stays unchanged on Vercel.

## What's included (MVP)

- Login with Sanctum token (secure storage)
- Farmer home with bottom navigation
- **My Farms** list + farm detail with Esri satellite map
- Placeholders for Reports and Advisories (next updates)

## What you need to install first

Flutter is **not installed** on this machine yet. Install it once:

1. Download Flutter for Windows: https://docs.flutter.dev/get-started/install/windows
2. Add Flutter to your PATH (e.g. `C:\src\flutter\bin`)
3. Install **Android Studio** (for Android SDK + emulator): https://developer.android.com/studio
4. Verify:

```powershell
flutter doctor
```

Fix anything `flutter doctor` marks with ❌ (especially Android toolchain).

---

## One-time project setup

From the repo root:

```powershell
cd mobile

# Generate android/ and ios/ platform folders (keeps lib/ intact)
flutter create . --org com.agriconnect.in --project-name agriconnect_mobile

flutter pub get
```

---

## Configure API URL

The app talks to your Railway Laravel backend.

**Production (default in code):**
```
https://agriconnect-production.up.railway.app/api/v1
```

If your Railway URL is different, pass it when running or building:

```powershell
flutter run --dart-define=API_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app/api/v1
```

**Local backend (Android emulator → your PC):**
```powershell
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000/api/v1
```

**Local backend (physical phone on same Wi‑Fi):**
```powershell
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:8000/api/v1
```

Update the default in `lib/config/api_config.dart` if you prefer not to pass `--dart-define` every time.

---

## Run on emulator or phone

```powershell
cd mobile
flutter devices          # list connected devices / emulators
flutter run              # debug mode
```

Log in with a **farmer** account (same email/password as the web app).

---

## Build APK (release)

```powershell
cd mobile
flutter build apk --release --dart-define=API_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app/api/v1
```

APK output:
```
mobile/build/app/outputs/flutter-apk/app-release.apk
```

Install on Android: copy the APK to the phone and open it (enable “Install unknown apps” if prompted).

---

## Android permissions (after `flutter create`)

For GPS (future incident reporting), ensure `android/app/src/main/AndroidManifest.xml` includes:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

`INTERNET` is added by default. Location permissions will be needed in the next phase.

---

## Project structure

```
mobile/
├── lib/
│   ├── config/          # API URL, theme
│   ├── core/            # Dio client, secure storage
│   ├── models/          # User, Farm
│   ├── services/        # Auth, farms API
│   ├── providers/       # Auth state
│   ├── screens/         # Login, farms, map detail
│   └── widgets/         # Map, loading, empty states
├── pubspec.yaml
└── README.md
```

---

## Roadmap

| Phase | Features |
|-------|----------|
| **Done** | Login, farms list, farm map view |
| **Next** | Report incident + GPS + photo upload |
| **Then** | Advisories feed, appointments, push notifications |
| **Later** | Register farm on mobile, offline cache |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `flutter: command not found` | Install Flutter and add to PATH |
| Login fails / network error | Check `API_BASE_URL` and that Railway backend is running |
| Blank map tiles | Phone needs internet; Esri tiles load from ArcGIS Online |
| “Farmer accounts only” | Mobile MVP is farmer-only; staff roles use the web app |
| Gradle / SDK errors | Run `flutter doctor --android-licenses` and accept licenses |

---

## Web app

The React web app is unchanged:
- **Web:** https://agri-connect-smoky.vercel.app
- **API:** Railway Laravel `/api/v1`

Both web and mobile share the same backend.
