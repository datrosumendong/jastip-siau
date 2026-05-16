@echo off
echo [1/3] Menyimpan perubahan ke Git...
git add .
git commit -m "MVC Update: Frontend Statis & Backend App Hosting"
git push origin main

echo [2/3] Memasak VIEW (Frontend Statis)...
call npm.cmd run build

echo [3/3] Mengirim ke jastipsiauid.web.app...
call firebase deploy --only hosting

echo Selesai! 
echo VIEW sudah online di jastipsiauid.web.app
echo CONTROLLER (Backend) sedang di-build otomatis oleh GitHub di App Hosting.
pause
