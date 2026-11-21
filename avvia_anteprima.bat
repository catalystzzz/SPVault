@echo off
title SPVault - Anteprima Locale
cd /d "%~dp0"
echo =======================================================
echo   SPVault Preview - Server Locale
echo   L'anteprima sara visibile su: http://localhost:8080
echo =======================================================
echo.
node ./quartz/bootstrap-cli.mjs build --serve
pause
