@echo off
title FlowWatcher — Dev Runner
echo ============================================
echo   FlowWatcher — Starting Development Build
echo ============================================
echo.

:: Step 1 — Run core Rust tests
echo [1/3] Running core Rust tests...
cd /d "%~dp0core"
cargo test 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [FAIL] Core Rust tests failed! Fix errors before running the app.
    pause
    exit /b 1
)
echo [PASS] All core tests passed.
echo.

:: Step 2 — Check frontend build
echo [2/3] Checking frontend build...
cd /d "%~dp0apps\desktop"
call npm run build 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [FAIL] Frontend build failed! Fix errors before running the app.
    pause
    exit /b 1
)
echo [PASS] Frontend build succeeded.
echo.

:: Step 3 — Launch Tauri dev
echo [3/3] Launching FlowWatcher (Tauri dev)...
echo       Press Ctrl+C to stop.
echo ============================================
echo.
call npm run tauri dev
