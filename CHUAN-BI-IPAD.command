#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
echo 'Russian Kitty · Chuẩn bị dự án iPad'
if [[ "$(uname -s)" != Darwin ]]; then
  echo 'Chạy script này trên MacBook, không phải Windows.'; exit 1
fi
if ! command -v xcodebuild >/dev/null || ! xcodebuild -version >/dev/null 2>&1; then
  echo 'Cần cài/mở Xcode từ Mac App Store và hoàn tất phần thiết lập lần đầu.'
  echo 'Nếu Xcode đã cài nhưng Command Line Tools chưa chọn đúng, vào Xcode > Settings > Locations và chọn phiên bản Xcode.'
  exit 1
fi
if ! command -v node >/dev/null || ! node -e 'process.exit(Number(process.versions.node.split(".")[0])>=22?0:1)'; then
  echo 'Cần Node.js 24 LTS từ https://nodejs.org/. Cài xong mở lại Terminal.'; exit 1
fi
if ! command -v pod >/dev/null; then
  echo 'Cần CocoaPods. Nếu đã có Homebrew: brew install cocoapods'
  echo 'Hướng dẫn: https://guides.cocoapods.org/using/getting-started.html'; exit 1
fi
cd NgaNgo.App
npm ci --no-audit --no-fund
npm run ios:sync
npx cap open ios
echo 'Đã mở dự án. Xem CAI-IPAD-MAC-M1.md để chọn Team và cài lên iPad.'
