@echo off
echo ========================================
echo  Uploading Missing Folders to GitHub
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git remote add origin https://github.com/keerthivasan98406-blip/nature_care_impex.git
)

echo.
echo Adding CSS folder...
git add css/

echo Adding JS folder...
git add js/

echo Adding Assets folder...
git add assets/

echo.
echo Committing changes...
git commit -m "Add CSS, JS, and assets folders for GitHub Pages"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  Upload Complete!
echo ========================================
echo.
echo Wait 2-3 minutes, then check your site:
echo https://keerthivasan98406-blip.github.io/nature_care_impex
echo.
pause