@echo off
echo ===================================================
echo     AYPA E-commerce - Application Starter
echo ===================================================
echo.
echo This script will start both the client and server
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    goto :end
)

echo Note: Make sure MongoDB is running on localhost:27017
echo.
set /p confirm=Continue? (Y/N): 
if /i "%confirm%" NEQ "Y" goto :end

echo.
echo ===================================================
echo Starting the server...
echo ===================================================
start cmd /k "cd /d %~dp0server && npm start"

REM Wait a moment for server to initialize before starting client
timeout /t 5 /nobreak > nul

echo.
echo ===================================================
echo Starting the client...
echo ===================================================
start cmd /k "cd /d %~dp0client && npm start"

echo.
echo ===================================================
echo Both applications are starting!
echo.
echo - Server runs on: http://localhost:5000
echo - Client runs on: http://localhost:3000
echo.
echo To stop both applications, close their terminal windows
echo ===================================================
echo.

:end
pause 