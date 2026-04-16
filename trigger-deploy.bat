@echo off
echo Triggering Render deployment...
git add -A
git commit -m "Trigger redeploy - mobile nav fix"
git push origin main
echo Done! Check Render dashboard for deployment status.
