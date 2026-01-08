@echo off
echo ====================================
echo Starting TravelGo Frontend
echo ====================================
echo.

cd /d "%~dp0frontend"

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting frontend on port 3001...
echo Press Ctrl+C to stop
echo.

npm start

pause
