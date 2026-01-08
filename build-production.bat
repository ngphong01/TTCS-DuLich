@echo off
echo ========================================
echo   TravelGo Production Build
echo ========================================
echo.

echo [1/3] Installing dependencies...
cd /d "%~dp0"
call npm install --workspace backend
call npm install --workspace frontend

echo.
echo [2/3] Generating Prisma client...
cd /d "%~dp0\backend"
call npx prisma generate

echo.
echo [3/3] Building frontend...
cd /d "%~dp0\frontend"
call npm run build

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Frontend build is ready at: frontend\build\
echo.
echo To test locally:
echo   1. Start backend: cd backend ^&^& npm start
echo   2. Serve frontend: cd frontend ^&^& npx serve -s build -l 3001
echo.
pause

