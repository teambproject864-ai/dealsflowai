@echo off
setlocal enabledelayedexpansion

REM =========================================
REM  DealFlow AI Setup Script
REM  For Windows systems
REM =========================================

echo ========================================
echo   DealFlow AI Setup
echo ========================================
echo.

REM --- Check for Node.js ---
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM --- Check for npm ---
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm found: %NPM_VERSION%

echo.
echo [INFO] Installing npm dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install npm dependencies
    exit /b 1
)
echo [OK] npm dependencies installed successfully

echo.
REM --- Check for .env file ---
if not exist ".env" (
    echo [INFO] .env file not found, copying .env.example to .env...
    copy ".env.example" ".env"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create .env file
        exit /b 1
    )
    echo [OK] .env file created
    echo.
    echo [ACTION REQUIRED] Please open .env and fill in your API keys!
) else (
    echo [OK] .env file already exists
)

echo.
REM --- Check for Python (optional) ---
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('python -V') do set PYTHON_VERSION=%%i
    echo [OK] %PYTHON_VERSION% found
    if exist "python-agent-service\requirements.txt" (
        echo [INFO] Python service dependencies detected. To install:
        echo   cd python-agent-service
        echo   python -m venv venv
        echo   .\venv\Scripts\activate
        echo   pip install -r requirements.txt
    )
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open .env and configure all required API keys
echo 2. Start the dev server: npm run dev
echo 3. (Optional) Set up Firebase service account key
echo.
echo For more information, see README.md
echo.
