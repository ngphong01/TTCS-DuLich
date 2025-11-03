@echo off
echo ====================================
echo KIEM TRA BACKEND TRAVELGO
echo ====================================
echo.

cd /d "%~dp0"

echo [1/5] Kiem tra Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chua duoc cai dat!
    pause
    exit /b 1
)
echo ✓ Node.js OK

echo.
echo [2/5] Kiem tra file .env...
if not exist ".env" (
    echo ❌ File .env khong ton tai!
    echo 💡 Tao file .env tu ENV_SAMPLE.txt
    pause
    exit /b 1
)
echo ✓ File .env ton tai

echo.
echo [3/5] Kiem tra dependencies...
if not exist "node_modules" (
    echo ❌ node_modules chua duoc cai dat!
    echo 💡 Chay: npm install
    pause
    exit /b 1
)
echo ✓ Dependencies da duoc cai dat

echo.
echo [4/5] Kiem tra Prisma Client...
if not exist "node_modules\.prisma" (
    echo ⚠ Prisma Client chua duoc generate!
    echo 💡 Dang generate...
    call npm run prisma:generate
    if errorlevel 1 (
        echo ❌ Loi khi generate Prisma Client
        pause
        exit /b 1
    )
)
echo ✓ Prisma Client OK

echo.
echo [5/5] Dang khoi dong backend...
echo.
echo Neu co loi, se hien thi o day:
echo ====================================
echo.

node index.js

pause

