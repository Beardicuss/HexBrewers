param(
    [string]$Bucket = "hexbrewers-assets",
    [string]$Release = "20261024-complete"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$wrangler = Join-Path $projectRoot "node_modules/.bin/wrangler.cmd"
$mediaDirectories = @("images", "videos", "music", "sounds", "audio")

$contentTypes = @{
    ".avif" = "image/avif"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png" = "image/png"
    ".webp" = "image/webp"
    ".mp3" = "audio/mpeg"
    ".ogg" = "audio/ogg"
    ".wav" = "audio/wav"
    ".mp4" = "video/mp4"
    ".webm" = "video/webm"
}

$files = foreach ($directory in $mediaDirectories) {
    $source = Join-Path $projectRoot "public/$directory"
    if (Test-Path -LiteralPath $source) {
        Get-ChildItem -LiteralPath $source -File -Recurse
    }
}

$publicRoot = (Resolve-Path (Join-Path $projectRoot "public")).Path
foreach ($file in $files) {
    $relative = $file.FullName.Substring($publicRoot.Length).TrimStart("\", "/").Replace("\", "/")
    $key = "releases/$Release/$relative"
    $contentType = $contentTypes[$file.Extension.ToLowerInvariant()]
    if (-not $contentType) { $contentType = "application/octet-stream" }

    Write-Host "Uploading $relative"
    & $wrangler r2 object put "$Bucket/$key" --file $file.FullName --content-type $contentType --remote
    if ($LASTEXITCODE -ne 0) { throw "Upload failed: $relative" }
}

Write-Host "Uploaded $($files.Count) assets to $Bucket/releases/$Release"
