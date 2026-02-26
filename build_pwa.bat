echo "Устанавливаем Bubblewrap CLI..."
call npm install -g @google/bubblewrap

echo "Создаем PWA Android проект..."
mkdir aibat-pwa
cd aibat-pwa

echo "Инициализируем Bubblewrap. Если попросит указать пути к JDK или Android SDK - просто жмите Enter, он скачает их сам!"
call bubblewrap init --manifest https://stud.whoim.space/manifest.json

echo "Собираем APK файл! Придумайте и введите пароль для подписи приложения, когда он попросит."
call bubblewrap build

echo "Готово! Ваш APK файл будет лежать в папке aibat-pwa!"
pause
