@echo off
echo Seeding AYPA E-commerce Database...
echo.
cd /d %~dp0
echo Current directory: %CD%
echo.
echo Note: Make sure MongoDB is running on localhost:27017
echo.
echo This will clear all existing data and add sample data!
echo.
set /p confirm=Are you sure you want to continue? (Y/N): 
if /i "%confirm%" NEQ "Y" goto :end

echo.
echo Seeding database...
echo.
node seed.js

:end
echo.
pause 