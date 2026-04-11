@echo off
echo ========================================
echo   Celebrity Platform - Deploy to GitHub
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Download from: https://git-scm.com/download/win
    echo Install it, then run this script again.
    pause
    exit /b 1
)

echo Git found. Proceeding...
echo.

REM Initialize git if not already done
if not exist ".git" (
    echo Initializing git repository...
    git init
    echo.
)

REM Ask for GitHub repo URL if not set
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo No remote found. Please enter your GitHub repository URL:
    echo Example: https://github.com/yourusername/celeb-platform.git
    echo.
    set /p REPO_URL="GitHub URL: "
    git remote add origin %REPO_URL%
)

echo Adding all files...
git add .

echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Production deployment

git commit -m "%COMMIT_MSG%"

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   SUCCESS! Code pushed to GitHub.
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Go to https://render.com
echo 2. New ^> Web Service ^> Connect your GitHub repo
echo 3. Backend: Root Dir = CelebBackend-main, Start = node server.js
echo 4. Frontend: New ^> Static Site, Root Dir = CelebFrontend-master
echo 5. Add environment variables (see RENDER_ENV_VARS.txt)
echo.
pause
