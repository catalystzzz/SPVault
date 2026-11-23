@echo off
title SPVault - Anteprima Locale
cd /d "%~dp0"
echo =======================================================
echo   1/2 - Aggiornamento automatico pagine e indici...
echo =======================================================
python ensure_empty_folders.py
python update_recent.py
python update_roster.py
python update_tags.py
python update_multimedia.py
echo.
echo =======================================================
echo   2/2 - SPVault Preview - Server Locale
echo   L'anteprima sara visibile su: http://localhost:8080
echo =======================================================
echo.
node ./quartz/bootstrap-cli.mjs build --serve
pause
