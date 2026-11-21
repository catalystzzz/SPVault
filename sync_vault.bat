@echo off
title Sincronizzazione SPVault su GitHub
cd /d "%~dp0"

echo =======================================================
echo   1/2 - Aggiornamento automatico pagine e indici...
echo =======================================================
python update_recent.py
python update_roster.py
python update_tags.py
python update_multimedia.py

echo.
echo =======================================================
echo   2/2 - Invio modifiche a GitHub...
echo =======================================================
git add .
git commit -m "Aggiornamento database (%date% %time:~0,5%)"
git push origin main

echo.
echo =======================================================
echo   Fatto! GitHub Actions sta compilando e pubblicando.
echo =======================================================
pause
