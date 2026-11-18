@echo off
title Sincronizzazione SPVault su GitHub
echo ==========================================
echo   Invio modifiche del Vault a GitHub...
echo ==========================================
echo.

git add .
git commit -m "Aggiornamento note Obsidian (%date% %time:~0,5%)"
git push origin main

echo.
echo ==========================================
echo   Fatto! GitHub Actions sta compilando il sito.
echo ==========================================
pause