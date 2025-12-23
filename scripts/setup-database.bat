@echo off
REM Script setup database cho TravelGo (Windows)
REM Usage: scripts\setup-database.bat [mysql_user] [mysql_password]

setlocal enabledelayedexpansion

set MYSQL_USER=%1
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set MYSQL_PASSWORD=%2
if "%MYSQL_PASSWORD%"=="" set MYSQL_PASSWORD=123456

set DB_NAME=travelgo

echo.
echo ========================================
echo   TravelGo Database Setup
echo ========================================
echo.

REM Check if MySQL is available
echo Checking MySQL connection...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Cannot connect to MySQL. Please check:
    echo    - MySQL is running
    echo    - Username and password are correct
    echo    - User has CREATE DATABASE permission
    pause
    exit /b 1
)
echo [OK] MySQL connection successful
echo.

REM Create database
echo Creating database '%DB_NAME%'...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)
echo [OK] Database created
echo.

REM Import SQL file
if exist "database\travelgo_complete.sql" (
    echo Importing database from travelgo_complete.sql...
    mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% < database\travelgo_complete.sql
    if errorlevel 1 (
        echo [ERROR] Failed to import SQL file
        pause
        exit /b 1
    )
    echo [OK] Database imported successfully
    echo.
    
    REM Import extended data if exists
    if exist "database\travelgo_extended_data.sql" (
        echo Importing extended data...
        mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% < database\travelgo_extended_data.sql
        echo [OK] Extended data imported
        echo.
    )
) else (
    echo [WARNING] SQL file not found. Using Prisma migrate instead...
    echo.
    
    echo Running Prisma migrations...
    call npm run prisma:migrate
    if errorlevel 1 (
        echo [ERROR] Prisma migrate failed
        pause
        exit /b 1
    )
    
    echo Running Prisma seed...
    call npm run prisma:seed
)

REM Verify data
echo Verifying database...
for /f "tokens=*" %%i in ('mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -D %DB_NAME% -se "SELECT COUNT(*) FROM Destination;" 2^>nul') do set DEST_COUNT=%%i
for /f "tokens=*" %%i in ('mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -D %DB_NAME% -se "SELECT COUNT(*) FROM Tour;" 2^>nul') do set TOUR_COUNT=%%i
for /f "tokens=*" %%i in ('mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -D %DB_NAME% -se "SELECT COUNT(*) FROM Hotel;" 2^>nul') do set HOTEL_COUNT=%%i
for /f "tokens=*" %%i in ('mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -D %DB_NAME% -se "SELECT COUNT(*) FROM Restaurant;" 2^>nul') do set RESTAURANT_COUNT=%%i

echo.
echo Database Statistics:
echo    - Destinations: %DEST_COUNT%
echo    - Tours: %TOUR_COUNT%
echo    - Hotels: %HOTEL_COUNT%
echo    - Restaurants: %RESTAURANT_COUNT%
echo.

if %DEST_COUNT% GTR 0 (
    echo [SUCCESS] Database setup completed!
    echo.
    echo Admin Accounts:
    echo    Email: admin@travelgo.dev
    echo    Password: admin123
    echo.
    echo    Email: phong@triennguyen.com
    echo    Password: Phong@2004
) else (
    echo [WARNING] Database created but may be empty. Run seed manually:
    echo    npm run prisma:seed
)

echo.
echo Setup complete! You can now start the application:
echo    npm run dev:all
echo.
pause

