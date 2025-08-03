@echo off
REM Set UTF-8 encoding
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Settings
set "codeName=ThumbsCleaner"
set "PROJECT_DIR=E:\Administration\code\cmDirSettings"

cd /d %~dp0

set "LOG_DIR=%PROJECT_DIR%\log"
set "SCRIPT_PATH=%PROJECT_DIR%\src\cmDir\GDriveThumbsCleaner\%codeName%.ts"

REM Create log directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Write start time to two log files
set "START_TIME=%date% %time%"
echo [%START_TIME%] > "%LOG_DIR%\%codeName%_success.log"
echo [%START_TIME%] > "%LOG_DIR%\%codeName%_error.log"

cd >> "%LOG_DIR%\%codeName%_error.log"

REM Change to project directory
cd /d "%PROJECT_DIR%" >> "%LOG_DIR%\%codeName%_error.log" 2>&1
if errorlevel 1 (
    echo [%date% %time%] Directory change error >> "%LOG_DIR%\%codeName%_error.log"
    exit /b 1
)

REM Wait before execution
timeout /t 1 /nobreak >nul

REM Execute script
tsx "%SCRIPT_PATH%" >> "%LOG_DIR%\%codeName%_success.log" 2>> "%LOG_DIR%\%codeName%_error.log"
set "EXIT_CODE=!errorlevel!"

REM Record execution result
set "END_TIME=%date% %time%"
if !EXIT_CODE! equ 0 (
    echo [%END_TIME%] Task completed successfully >> "%LOG_DIR%\%codeName%_success.log"
) else (
    echo [%END_TIME%] Task failed (Exit code: !EXIT_CODE!) >> "%LOG_DIR%\%codeName%_error.log"
)

REM Wait after execution
timeout /t 5 /nobreak >nul

REM Return exit code
exit /b !EXIT_CODE!
