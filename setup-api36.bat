@echo off
setlocal
npm install
if errorlevel 1 exit /b 1
if exist android\app\build.gradle (
  npm run android:sync
) else (
  npm run android:add
)
if errorlevel 1 exit /b 1
npm run android:verify
if errorlevel 1 exit /b 1
echo.
echo FireOps Calc Android API 36 setup complete.
echo Run: npm run android:open
