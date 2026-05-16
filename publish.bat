@echo off
echo [1/3] Menyimpan perubahan ke Git...
git add .
git commit -m "Auto-publish: %date% %time%"
git push origin main

echo [3/3] Mengirim ke Firebase Hosting...
call firebase deploy --only hosting

echo Selesai! Aplikasi kamu sudah online di jastipsiauid.web.app
pause
