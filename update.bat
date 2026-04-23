@echo off
:: دعم اللغة العربية في الكوماند بروومبت
chcp 65001 >nul
title Mushaf Fast Deployer
echo ==========================================
echo      REPAIRING AND DEPLOYING MUSHAF
echo ==========================================

:: --- هنا السؤال السحري ---
echo.
set /p DEPLOY_NAME="اكتب الاسم اللي عاوزه يظهر في صفحة جيت هاب (ثم اضغط Enter): "
echo.

echo [1/7] Installing Core Capacitor Android...
call npm install @capacitor/core @capacitor/android @capacitor/cli
if %ERRORLEVEL% neq 0 goto :error

echo [2/7] Installing Geolocation...
call npm install @capacitor/geolocation
if %ERRORLEVEL% neq 0 goto :error

echo [3/7] Updating Android Platform...
call npx cap sync android
if %ERRORLEVEL% neq 0 goto :error

echo [4/7] Building web project...
call npm run build
if %ERRORLEVEL% neq 0 goto :error

echo [5/7] Setting up Git...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/alaa2008ahmed-ui/-mushaf-al---.git

echo [6/7] Committing with your name...
git add .
:: اللي إنت كتبته في الأول هو اللي هيظهر في الـ Actions
git commit -m "%DEPLOY_NAME%"

echo [7/7] Pushing to GitHub...
git push -u origin main --force
if %ERRORLEVEL% neq 0 goto :error

echo ==========================================
echo      SUCCESS! %DEPLOY_NAME% is LIVE
echo ==========================================
:: الخروج الفوري
timeout /t 5
exit

:error
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo     ERROR DETECTED! Process Stopped.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pause
exit