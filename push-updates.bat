@echo off
echo ========================================
echo Pushing Updates to GitHub
echo ========================================
echo.

echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix Buy Now functionality and complete e-commerce order flow"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Check your website at:
echo https://keerthivasan98406-blip.github.io/nature_care_impex
echo ========================================
pause
