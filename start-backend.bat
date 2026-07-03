@echo off
echo ========================================
echo  Get Yourself Backend Startup Script
echo ========================================
echo.

echo [1/3] Cleaning old build...
cd /d D:\Get-Yourself\backend
call mvn clean -q

echo [2/3] Building project...
call mvn compile -q
if %ERRORLEVEL% NEQ 0 (
    echo BUILD FAILED! Check errors above.
    pause
    exit /b 1
)

echo [3/3] Starting Spring Boot...
echo.
echo Backend starting at http://localhost:8080
echo Press Ctrl+C to stop
echo.
call mvn spring-boot:run
