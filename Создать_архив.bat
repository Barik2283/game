@echo off
chcp 65001 >nul
echo ========================================
echo   CASINO ROYALE - Архив для Яндекс Игр
echo ========================================
echo.

set "zipfile=casino-royale-yandex.zip"

if exist "%zipfile%" (
    del /f /q "%zipfile%"
    echo Старый архив удалён
)

echo Создание ZIP-архива...
powershell -Command "Compress-Archive -Path 'index.html','yandex-manifest.json','css','js','icons' -DestinationPath '%zipfile%' -CompressionLevel Optimal -Force"

echo.
echo ========================================
echo   ПРОВЕРКА ФАЙЛОВ
echo ========================================
echo.

if exist "index.html" echo [OK] index.html
if exist "yandex-manifest.json" echo [OK] yandex-manifest.json
if exist "css\style.css" echo [OK] css\style.css
if exist "js\main.js" echo [OK] js\main.js
if exist "js\yandex-sdk.js" echo [OK] js\yandex-sdk.js

echo.
echo Игры:
for %%f in (game-slots game-roulette game-cards game-dice game-mines game-wheel game-blackjack game-poker) do (
    if exist "js\%%f.js" echo [OK] js\%%f.js
)

echo.
if exist "icons\generate-icons.html" echo [OK] icons\generate-icons.html

echo.
if exist "%zipfile%" (
    echo ========================================
    echo   АРХИВ СОЗДАН: %zipfile%
    echo ========================================
    echo.
    echo Следующий шаг:
    echo 1. Откройте icons/generate-icons.html
    echo 2. Создайте иконки (4 файла)
    echo 3. Загрузите архив в Яндекс Игры
    echo    https://games.yandex.ru/console/
    echo.
) else (
    echo ОШИБКА: Архив не создан!
)

echo.
pause
