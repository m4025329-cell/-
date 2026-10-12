#!/usr/bin/env bash
# Собирает готовый APK для установки «по ссылке» (без Android Studio и без Google Play).
# Нужны: JDK 17+ и пакеты Debian/Ubuntu: aapt, apksigner, zipalign, libandroid-23-java, dalvik-exchange
#   sudo apt-get install aapt apksigner zipalign libandroid-23-java dalvik-exchange
# Запуск: ./build-apk.sh  → файл ../Pervyi-stolik.apk
# Ключ подписи создаётся один раз (sideload.jks) и НЕ попадает в git. Потерял ключ — новые версии придётся ставить, удалив старую.
set -euo pipefail
cd "$(dirname "$0")"
PKG=ru.pervyistolik.game
VERSION=$(sed -n 's/.*versionName = "\(.*\)".*/\1/p' app/build.gradle.kts)
VCODE=$(sed -n 's/.*versionCode = \([0-9]*\).*/\1/p' app/build.gradle.kts)
TARGET=$(sed -n 's/.*targetSdk = \([0-9]*\).*/\1/p' app/build.gradle.kts)
ANDROID_JAR=${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}
B=build-apk
rm -rf "$B" && mkdir -p "$B/gen" "$B/classes" "$B/apk"
# 1. игра внутрь приложения
ASSETS="$B/assets/www"; mkdir -p "$ASSETS/icons"
cp ../../index.html "$ASSETS/index.html"; cp ../../manifest.webmanifest "$ASSETS/"; cp ../../icons/icon-192.png ../../icons/icon-512.png ../../icons/icon.svg "$ASSETS/icons/"
# 2. манифест для aapt (в Gradle-проекте пакет задан в build.gradle.kts, здесь его нужно вписать)
sed -e "s#<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">#<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\" package=\"$PKG\" android:versionCode=\"$VCODE\" android:versionName=\"$VERSION\"><uses-sdk android:minSdkVersion=\"24\" android:targetSdkVersion=\"$TARGET\"/>#" \
    -e '/android:roundIcon/d' app/src/main/AndroidManifest.xml > "$B/AndroidManifest.xml"
# 3. ресурсы и R.java
aapt package -f -m -J "$B/gen" -M "$B/AndroidManifest.xml" -S app/src/main/res -A "$B/assets" -I "$ANDROID_JAR" -0 arsc -F "$B/apk/base.apk" --min-sdk-version 24 --target-sdk-version "$TARGET"
# 4. код
javac --release 8 -encoding UTF-8 -Xlint:-options -cp "$ANDROID_JAR" -d "$B/classes" $(find "$B/gen" app/src/main/java -name '*.java')
dalvik-exchange --dex --min-sdk-version=24 --output="$B/apk/classes.dex" "$B/classes" >/dev/null 2>&1 || dx --dex --output="$B/apk/classes.dex" "$B/classes"
(cd "$B/apk" && aapt add base.apk classes.dex >/dev/null)
# 5. выравнивание и подпись
zipalign -f -p 4 "$B/apk/base.apk" "$B/apk/aligned.apk"
if [ ! -f sideload.jks ]; then
  keytool -genkeypair -keystore sideload.jks -storepass pervyistolik -keypass pervyistolik -alias pervyistolik -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Pervyi stolik, O=School project, C=RU" >/dev/null 2>&1
fi
apksigner sign --v4-signing-enabled false --ks sideload.jks --ks-pass pass:pervyistolik --key-pass pass:pervyistolik --min-sdk-version 24 --out ../Pervyi-stolik.apk "$B/apk/aligned.apk"
apksigner verify --verbose ../Pervyi-stolik.apk | head -6
echo "Готово: play/Pervyi-stolik.apk, версия $VERSION ($VCODE), $(du -k ../Pervyi-stolik.apk | cut -f1) КБ"
