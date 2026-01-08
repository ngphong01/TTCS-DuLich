@echo off
echo ====================================
echo Starting TravelGo Backend Server
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
echo Checking database connection...
echo.

node check-database.js

if %errorlevel% neq 0 (
    echo.
    echo Database check failed! Please check your database connection.
    echo.
    pause
    exit /b 1
)

echo.
echo Starting backend server on port 3000...
echo Press Ctrl+C to stop
echo.

npm start

pause
