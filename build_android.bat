echo "Установка зависимостей Capacitor..."
npm install

echo "Сборка веб-приложения (Vite)..."
npm run build

echo "Инициализация платформы Android..."
npx cap add android

echo "Синхронизация веб-ресурсов с Android..."
npx cap sync android

echo "Запуск Android Studio..."
npx cap open android

echo "Готово! Теперь в Android Studio дождитесь синхронизации Gradle и нажмите Build -> Build Bundle(s) / APK(s) -> Build APK(s)"
pause
