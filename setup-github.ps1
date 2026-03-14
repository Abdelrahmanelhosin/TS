# PowerShell Script to Setup Git and Push to GitHub
# Using only ASCII characters to avoid encoding issues

Write-Host "Starting PolTem GitHub Setup..." -ForegroundColor Cyan

$REMOTE_URL = "https://github.com/Abdelrahmanelhosin/TS.git"

# 1. Initialize Git
if (!(Test-Path .git)) {
    Write-Host "Initializing Git repository..."
    git init
} else {
    Write-Host "Git is already initialized."
}

# 2. Add Remote
Write-Host "Adding remote origin..."
git remote remove origin 2>$null
git remote add origin $REMOTE_URL

# 3. Add Files
Write-Host "Adding files (respecting .gitignore)..."
git add .

# 4. Initial Commit
Write-Host "Creating initial commit..."
git commit -m "Initial commit: PolTem Project"
git branch -M main

Write-Host ""
Write-Host "--------------------------------------------------------" -ForegroundColor Yellow
Write-Host "FINAL STEP:" -ForegroundColor Yellow
Write-Host "Now run this command to push your files to GitHub:" -ForegroundColor Green
Write-Host "   git push -u origin main" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor Yellow

Write-Host "Local setup complete!" -ForegroundColor Green
