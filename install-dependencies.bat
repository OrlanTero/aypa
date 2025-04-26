@echo off
echo ===================================================
echo     AYPA E-commerce - Dependencies Installer
echo ===================================================
echo.
echo This script will install all dependencies for both client and server
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    goto :end
)

echo Current directory: %CD%
echo.

REM Install server dependencies
echo ===================================================
echo Installing server dependencies...
echo ===================================================
cd /d %~dp0server
echo Current directory: %CD%
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing server dependencies!
    goto :end
)
echo.
echo Server dependencies installed successfully!
echo.

REM Install client dependencies
echo ===================================================
echo Installing client dependencies...
echo ===================================================
cd /d %~dp0client
echo Current directory: %CD%
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing client dependencies!
    goto :end
)
echo.
echo Client dependencies installed successfully!
echo.

REM Return to root directory
cd /d %~dp0
echo.
echo ===================================================
echo All dependencies installed successfully!
echo.
echo You can now:
echo  1. Run the server: Double-click server\run-server.bat
echo  2. Seed the database: Double-click server\seed-database.bat
echo  3. Start the client: Open a terminal in the client folder and run "npm start"
echo ===================================================

:end
pause 