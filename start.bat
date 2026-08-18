@echo off

cd /d "%~dp0"

echo.
echo ======================================
echo      PulseSync Twitch Overlay
echo ======================================
echo.
echo Запускаю HTTPS сервер...
echo.
echo Открой:
echo https://localhost:8443/
echo.
echo Для остановки нажми Ctrl+C
echo.

python server.py

pause