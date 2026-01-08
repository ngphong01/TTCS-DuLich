@echo off
echo ====================================
echo Starting TravelGo (Backend + Frontend)
echo ====================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing root dependencies if needed...
if not exist "node_modules" (
    call npm install
)

echo.
echo Starting both servers...
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run start:all

pause

