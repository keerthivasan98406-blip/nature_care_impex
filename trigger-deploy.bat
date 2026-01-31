@echo off
echo 🚀 Triggering Render Deployment...
echo.

echo 📝 Creating deployment trigger commit...
git add .
git commit --allow-empty -m "Trigger Render deployment - SEO fixes applied"

echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment triggered!
echo.
echo 🔍 Check deployment status at:
echo https://dashboard.render.com
echo.
echo 🌐 Your site will be updated at:
echo https://nature-care-impex-1.onrender.com
echo.
echo ⏱️  Deployment usually takes 2-5 minutes
echo.
pause