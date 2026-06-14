@echo off
setlocal enabledelayedexpansion

REM Script to reorganize files for Vite/Vercel deployment (Windows)
echo ========================================
echo DRHMMS Project Reorganization Script
echo ========================================
echo.

REM Check if src directory already exists and has files
if exist "src\" (
    echo Warning: src\ directory already exists and may contain files.
    echo Do you want to continue? This may overwrite existing files. (Y/N)
    set /p response=
    if /i not "!response!"=="Y" (
        echo Aborted.
        exit /b 1
    )
)

REM Create src directory if it doesn't exist
echo Creating src directory structure...
if not exist "src\" mkdir src
echo.

REM Move main directories to src
echo Moving project directories...
echo.

if exist "components\" (
    if not exist "src\components\" (
        echo   Moving components\ to src\components\
        move /y components src\ > nul
    ) else (
        echo   src\components\ already exists, skipping...
    )
) else (
    echo   No components\ directory found
)

if exist "context\" (
    if not exist "src\context\" (
        echo   Moving context\ to src\context\
        move /y context src\ > nul
    ) else (
        echo   src\context\ already exists, skipping...
    )
) else (
    echo   No context\ directory found
)

if exist "data\" (
    if not exist "src\data\" (
        echo   Moving data\ to src\data\
        move /y data src\ > nul
    ) else (
        echo   src\data\ already exists, skipping...
    )
) else (
    echo   No data\ directory found
)

if exist "types\" (
    if not exist "src\types\" (
        echo   Moving types\ to src\types\
        move /y types src\ > nul
    ) else (
        echo   src\types\ already exists, skipping...
    )
) else (
    echo   No types\ directory found
)

if exist "styles\" (
    if not exist "src\styles\" (
        echo   Moving styles\ to src\styles\
        move /y styles src\ > nul
    ) else (
        echo   src\styles\ already exists, skipping...
    )
) else (
    echo   No styles\ directory found
)

echo.
echo Moving main application files...

if exist "App.tsx" (
    if not exist "src\App.tsx" (
        echo   Moving App.tsx to src\App.tsx
        move /y App.tsx src\ > nul
    ) else (
        echo   src\App.tsx already exists, skipping...
    )
) else (
    echo   App.tsx already in src\ or not found
)

REM Check if main.tsx exists
if not exist "src\main.tsx" (
    echo   Warning: src\main.tsx not found!
) else (
    echo   src\main.tsx exists
)

REM Check if index.html exists
if not exist "index.html" (
    echo   Warning: index.html not found in root directory!
) else (
    echo   index.html exists in root
)

echo.
echo ========================================
echo Project structure reorganized!
echo ========================================
echo.
echo Current structure:
echo.
echo src\
if exist "src\" dir /b /ad src 2>nul
echo.
echo Root files:
dir /b *.json *.html *.md *.ts *.bat *.sh 2>nul
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Install dependencies:
echo    npm install
echo.
echo 2. Test locally:
echo    npm run dev
echo.
echo 3. Build for production:
echo    npm run build
echo.
echo 4. Deploy to Vercel:
echo    vercel --prod
echo.
echo For detailed instructions, see:
echo    - QUICKSTART.md (5-minute guide)
echo    - DEPLOYMENT.md (complete guide)
echo    - PRE_DEPLOYMENT_CHECKLIST.md (verification)
echo.
echo ========================================
echo Ready to deploy!
echo ========================================
echo.

pause
