@echo off
echo Starting TravelGo Backend Server...
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
echo.
npm start
