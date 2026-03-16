@echo off
:: دعم اللغة العربية
chcp 65001 >nul
title Mushaf Uploader

:: 1. مزامنة التعديلات مع أندرويد (مهمة جداً عشان اسم "أحمد وليلى" يسمع في الكود)
echo [1/3] Syncing Capacitor with Android...
call npx cap sync android
if %ERRORLEVEL% neq 0 goto :error

:: 2. تسجيل التعديلات
echo [2/3] Adding changes...
git add .
:: يمكنك تغيير الرسالة هنا لما تريد
git commit -m "Update: App Name to أحمد وليلى and Sound Fixes"

:: 3. الرفع لجيت هاب
echo [3/3] Pushing to GitHub...
git push origin main --force

if %ERRORLEVEL% equ 0 (
    echo ==========================================
    echo      SUCCESS! Build started on GitHub.
    echo ==========================================
    timeout /t 5
    exit
) else (
    :error
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo      ERROR! Check your connection.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    pause
    exit
)