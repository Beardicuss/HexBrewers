param(
    [string]$Bucket = "hexbrewers-assets",
    [string]$AppPrefix = "releases/current/app",
    [string]$MediaPrefix = "releases/20261024-complete"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$wrangler = Join-Path $projectRoot "node_modules/.bin/wrangler.cmd"

$contentTypes = @{
    ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
    ".css" = "text/css; charset=utf-8"; ".json" = "application/json"
    ".ico" = "image/x-icon"; ".png" = "image/png"; ".webp" = "image/webp"
    ".jpg" = "image/jpeg"; ".mp4" = "video/mp4"
}

function Publish-File([string]$FilePath, [string]$Key) {
    $extension = [IO.Path]::GetExtension($FilePath).ToLowerInvariant()
    $contentType = $contentTypes[$extension]
    if (-not $contentType) { $contentType = "application/octet-stream" }
    & $wrangler r2 object put "$Bucket/$Key" --file $FilePath --content-type $contentType --remote
    if ($LASTEXITCODE -ne 0) { throw "Upload failed: $FilePath" }
}

$distRoot = Join-Path $projectRoot "dist"
$distFiles = Get-ChildItem -LiteralPath $distRoot -File -Recurse
foreach ($file in $distFiles) {
    $relative = $file.FullName.Substring($distRoot.Length).TrimStart("\", "/").Replace("\", "/")
    Publish-File $file.FullName "$AppPrefix/$relative"
}

$softcurseSource = "D:/Dev/Assets/videos/Videos Intro/softcurse-systems.mp4"
Publish-File $softcurseSource "$MediaPrefix/videos/intro/softcurse-systems.mp4"
Write-Host "Published $($distFiles.Count) app files and the original Softcurse video to R2."
