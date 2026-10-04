#!/usr/bin/env bash
# Создаёт ключ загрузки (upload key) для подписи приложения. Запускай один раз и ХРАНИ файл и пароли в надёжном месте:
# потеряв ключ, ты не сможешь обновлять приложение так же легко.
set -e
cd "$(dirname "$0")"
keytool -genkeypair -v -keystore release-keystore.jks -alias sloyzasloem -keyalg RSA -keysize 2048 -validity 10000
echo "Готово. Теперь скопируй keystore.properties.example в keystore.properties и впиши пароли."
