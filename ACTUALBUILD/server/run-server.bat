@echo off
echo Starting AYPA E-commerce Server...
echo.
cd /d %~dp0
echo Current directory: %CD%
echo.
echo Note: Make sure MongoDB is running on localhost:27017
echo.
echo Press Ctrl+C to stop the server
echo.
npm start
pause 