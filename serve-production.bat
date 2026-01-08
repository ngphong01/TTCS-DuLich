@echo off
echo ========================================
echo   TravelGo Production Server
echo ========================================
echo.

echo Starting Backend on port 3000...
start "TravelGo Backend" cmd /k "cd /d %~dp0\backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend on port 3001...
start "TravelGo Frontend" cmd /k "cd /d %~dp0\frontend && npx serve -s build -l 3001"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press any key to open browser...
pause > nul

start http://localhost:3001

