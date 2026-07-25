#!/usr/bin/env bash
# Boots the Android emulator (Pixel_7_API_33 — the AVD that doesn't hit the
# JSC/SIGILL crash we found on API 34), makes sure the Expo Go build matching
# this project's SDK version is installed, starts Metro if it isn't already
# running, and opens the project inside the emulator.
set -euo pipefail

cd "$(dirname "$0")/.."

ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export ANDROID_HOME
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"

AVD_NAME="Pixel_7_API_33"

# Matches this project's Expo SDK (~57.0.8). If the SDK version in package.json
# ever changes, update these two lines to match:
# https://api.expo.dev/v2/versions/latest -> data.sdkVersions["<version>"].androidClientVersion / androidClientUrl
EXPO_GO_CLIENT_VERSION="57.0.2"
EXPO_GO_APK_URL="https://github.com/expo/expo-go-releases/releases/download/Expo-Go-${EXPO_GO_CLIENT_VERSION}/Expo-Go-${EXPO_GO_CLIENT_VERSION}.apk"

CACHE_DIR=".android-cache"
APK_PATH="${CACHE_DIR}/Expo-Go-${EXPO_GO_CLIENT_VERSION}.apk"
mkdir -p "$CACHE_DIR"

if ! curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
  echo "==> Starting Metro dev server..."
  nohup npx expo start --lan > /tmp/expo-metro.log 2>&1 &
  disown
else
  echo "==> Metro already running."
fi

if ! adb devices | grep -q "device$"; then
  echo "==> Booting ${AVD_NAME} (first boot can take a couple of minutes)..."
  nohup emulator -avd "$AVD_NAME" -no-snapshot -no-boot-anim > /tmp/expo-android-emulator.log 2>&1 &
  disown
  adb wait-for-device
else
  echo "==> Emulator already running."
fi

echo "==> Waiting for emulator boot to complete..."
until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
  sleep 2
done
echo "==> Emulator ready."

INSTALLED_VERSION="$(adb shell dumpsys package host.exp.exponent 2>/dev/null | grep versionName | head -1 | sed -E 's/.*versionName=([^ ]+).*/\1/' | tr -d '\r')"

if [ "$INSTALLED_VERSION" != "$EXPO_GO_CLIENT_VERSION" ]; then
  echo "==> Installing Expo Go ${EXPO_GO_CLIENT_VERSION} (found: ${INSTALLED_VERSION:-none})..."
  if [ ! -f "$APK_PATH" ]; then
    curl -sL "$EXPO_GO_APK_URL" -o "$APK_PATH"
  fi
  if [ -n "$INSTALLED_VERSION" ]; then
    adb uninstall host.exp.exponent > /dev/null 2>&1 || true
  fi
  adb install "$APK_PATH"
else
  echo "==> Expo Go ${EXPO_GO_CLIENT_VERSION} already installed."
fi

echo "==> Waiting for Metro to be ready..."
until curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; do
  sleep 1
done

echo "==> Opening the project in Expo Go..."
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent

echo "==> Done."
