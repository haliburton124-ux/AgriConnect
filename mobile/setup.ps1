# AgriConnect Mobile — first-time setup (Windows)
# Run from repo root:  .\mobile\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "AgriConnect Mobile setup" -ForegroundColor Green
Write-Host ""

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    Write-Host "Flutter is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install from: https://docs.flutter.dev/get-started/install/windows"
    Write-Host "Then re-run this script."
    exit 1
}

Set-Location $PSScriptRoot

Write-Host "Flutter version:"
flutter --version
Write-Host ""

Write-Host "Generating Android/iOS platform folders..."
flutter create . --org com.agriconnect.in --project-name agriconnect_mobile

Write-Host ""
Write-Host "Installing dependencies..."
flutter pub get

Write-Host ""
Write-Host "Running flutter doctor..."
flutter doctor

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Start Android emulator in Android Studio (or connect a phone with USB debugging)"
Write-Host "  2. cd mobile"
Write-Host "  3. flutter run --dart-define=API_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app/api/v1"
Write-Host ""
Write-Host "Build APK:"
Write-Host "  flutter build apk --release --dart-define=API_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app/api/v1"
