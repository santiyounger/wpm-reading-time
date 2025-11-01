# PowerShell script to prepare and create GitHub release for Obsidian plugin
# This script prepares the release files and guides you through creating the GitHub release

$VERSION = "1.0.0"
$RELEASE_DIR = "release-files"

Write-Host "Preparing release for version $VERSION..." -ForegroundColor Cyan

# Create release directory
if (Test-Path $RELEASE_DIR) {
    Remove-Item $RELEASE_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $RELEASE_DIR | Out-Null

# Copy release files
Write-Host "Copying release files..." -ForegroundColor Yellow
Copy-Item "main.js" -Destination $RELEASE_DIR
Copy-Item "manifest.json" -Destination $RELEASE_DIR
Copy-Item "styles.css" -Destination $RELEASE_DIR

Write-Host "[OK] Release files prepared in '$RELEASE_DIR' folder" -ForegroundColor Green
Write-Host ""
Write-Host "Files ready for upload:" -ForegroundColor Cyan
Write-Host "  - main.js" -ForegroundColor White
Write-Host "  - manifest.json" -ForegroundColor White
Write-Host "  - styles.css" -ForegroundColor White
Write-Host ""

# Check if changes need to be committed
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "[!] You have uncommitted changes. Consider committing them first:" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git commit -m 'Release version $VERSION'" -ForegroundColor Gray
    Write-Host ""
}

# Create git tag if it doesn't exist
$tagExists = git tag -l "v$VERSION"
if (-not $tagExists) {
    Write-Host "Creating git tag..." -ForegroundColor Yellow
    git tag "v$VERSION"
    Write-Host "[OK] Tag v$VERSION created" -ForegroundColor Green
    Write-Host ""
    Write-Host "Push the tag to GitHub:" -ForegroundColor Cyan
    Write-Host "   git push origin v$VERSION" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://github.com/santiyounger/obsidian-plugin-wpm-time/releases/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Tag version: $VERSION (or v$VERSION if you prefer)" -ForegroundColor White
Write-Host ""
Write-Host "3. Release title: v$VERSION (or just '$VERSION')" -ForegroundColor White
Write-Host ""
Write-Host "4. Description (optional):" -ForegroundColor White
Write-Host "   Initial release of How Long to Read plugin." -ForegroundColor Gray
Write-Host ""
Write-Host "5. Upload these 3 files from the '$RELEASE_DIR' folder:" -ForegroundColor White
Write-Host "   - main.js" -ForegroundColor Gray
Write-Host "   - manifest.json" -ForegroundColor Gray
Write-Host "   - styles.css" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Click 'Publish release'" -ForegroundColor White
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan

