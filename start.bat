@echo off
echo Starting Invoice App...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
cd /d "%~dp0"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo Starting application...
start http://localhost:5173

REM Wait a moment for the server to start
timeout /t 3 >nul

REM Minimize the console window
powershell -window minimized -command ""

call npm start
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to start application
    pause
    exit /b 1
)

pause
