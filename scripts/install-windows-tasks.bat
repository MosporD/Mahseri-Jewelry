@echo off
REM Registers Windows Task Scheduler jobs for Mahseri Telegram bots.
REM Right-click → Run as administrator (needed to create scheduled tasks).

set "ROOT=%~dp0.."
set "ROOT=%ROOT:~0,-1%"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not found in PATH. Install Node or add it to PATH, then retry.
  pause
  exit /b 1
)

echo Project folder:
echo   %ROOT%
echo.

schtasks /Create /F /TN "Mahseri Metal Alerts" ^
  /TR "\"%ROOT%\scripts\send-metal-alert-once.bat\"" ^
  /SC MINUTE /MO 10 /RU "%USERNAME%"

schtasks /Create /F /TN "Mahseri Product Posts" ^
  /TR "\"%ROOT%\scripts\post-scheduled-products-once.bat\"" ^
  /SC HOURLY /RU "%USERNAME%"

echo.
echo Created (or updated) scheduled tasks:
echo   Mahseri Metal Alerts   — every 10 minutes
echo   Mahseri Product Posts  — every hour
echo.
echo Test now:
schtasks /Run /TN "Mahseri Metal Alerts"
schtasks /Run /TN "Mahseri Product Posts"
echo.
echo Open Task Scheduler to view history if messages do not arrive.
pause
