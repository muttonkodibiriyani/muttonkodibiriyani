@echo off
REM Alshaya Investment Council - Local Demo Launcher (Windows)
REM Tries Node (npx serve) first, falls back to Python http.server.

setlocal
set PORT=3000
if not "%~1"=="" set PORT=%~1
set URL=http://localhost:%PORT%/index.html

cd /d "%~dp0"

echo.
echo   =====================================================
echo    Alshaya Investment Council - Local Demo
echo    v2.1.0
echo   =====================================================
echo.
echo    Starting on:   %URL%
echo    Stop server:   Ctrl+C
echo.

where npx >NUL 2>&1
if %ERRORLEVEL%==0 (
  echo    Using:         npx serve ^(Node.js^)
  echo.
  start "" "%URL%"
  npx --yes serve . -p %PORT% --no-clipboard
  goto :EOF
)

where python >NUL 2>&1
if %ERRORLEVEL%==0 (
  echo    Using:         python -m http.server
  echo.
  start "" "%URL%"
  python -m http.server %PORT%
  goto :EOF
)

where python3 >NUL 2>&1
if %ERRORLEVEL%==0 (
  echo    Using:         python3 -m http.server
  echo.
  start "" "%URL%"
  python3 -m http.server %PORT%
  goto :EOF
)

echo    ERROR: Neither Node.js nor Python is installed.
echo           Install Node 18+ from https://nodejs.org
echo           or Python 3 from https://python.org
pause
exit /b 1
