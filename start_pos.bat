@echo off


REM Kill any process using ports 3000, 4000, or 4010
for %%p in (3000 4000 4010) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Restart backend
cd /d "C:\Users\Supratik\DEV\posMonginis"

call pm2 start ecosystem.config.js --only pos-R3747

REM Navigate to the client directory
cd /d "C:\Users\Supratik\DEV\posMonginis\client"

REM Run npm start
call npm run start
