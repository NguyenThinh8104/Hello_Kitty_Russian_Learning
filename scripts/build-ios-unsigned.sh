#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
if [[ "$(uname -s)" != Darwin ]]; then
  echo 'Run this build on macOS with Xcode, or start the GitHub Actions workflow from Windows.' >&2
  exit 1
fi
mkdir -p "$root/artifacts/ios"
xcode_major="$(xcodebuild -version | head -n 1 | awk '{print $2}' | cut -d. -f1)"
if [[ "$xcode_major" -lt 26 ]]; then
  echo 'Xcode 26+ is required. Select Xcode 26 with DEVELOPER_DIR.' >&2; exit 1
fi
cd "$root/NgaNgo.App"
npm ci --no-audit --no-fund
npm run ios:sync
node --test ../tests/practice.test.mjs ../tests/sessions.test.mjs ../tests/audio.test.mjs ../tests/native-providers.test.mjs
work="$(mktemp -d "$root/artifacts/ios/build.XXXXXX")"
set -o pipefail
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -archivePath "$work/RussianKitty.xcarchive" \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY='' \
  DEVELOPMENT_TEAM='' archive 2>&1 | tee "$root/artifacts/ios/build.log"
app_path="$work/RussianKitty.xcarchive/Products/Applications/App.app"
test -d "$app_path"
executable="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$app_path/Info.plist")"
test -f "$app_path/$executable"
file "$app_path/$executable" | grep -q 'Mach-O'
lipo -archs "$app_path/$executable" | grep -qw arm64
mkdir -p "$work/package/Payload"
ditto "$app_path" "$work/package/Payload/RussianKitty.app"
cd "$work/package"
/usr/bin/zip -qry -y Russian-Kitty-unsigned.ipa Payload
mv Russian-Kitty-unsigned.ipa "$root/artifacts/ios/Russian-Kitty-unsigned.ipa"
cd "$root/artifacts/ios"
shasum -a 256 Russian-Kitty-unsigned.ipa > Russian-Kitty-unsigned.ipa.sha256
cat > INSTALL.txt <<'TEXT'
Russian Kitty — unsigned arm64 iPad/iPhone IPA

This is a compiled iOS application, not an App Store/TestFlight release.
It is NOT signed. It cannot be installed by just opening this file on an iPad.
Use your own Apple account and a compatible Windows sideloading tool to sign/install it.
See BUILD-IPA-TREN-WINDOWS.md in the source package.
No Apple password, signing certificate, or provisioning profile is required by this build workflow.
The app requires iOS/iPadOS 15 or later. Test microphone, speech recognition and PDF on a real device.
TEXT
echo 'IPA ready: artifacts/ios/Russian-Kitty-unsigned.ipa (unsigned; sign before installing).'
