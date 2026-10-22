param(
    [string]$SourceRoot = "C:\Users\DanTe\Downloads\Core Art Refresh and Menu Hub"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$ffmpeg = "C:\Users\DanTe\Tools\ffmpeg\bin\ffmpeg.exe"

function Ensure-Dir([string]$Path) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

function Convert-WebP([string]$InputPath, [string]$OutputPath, [int]$Quality = 90) {
    Ensure-Dir (Split-Path -Parent $OutputPath)
    & $ffmpeg -hide_banner -loglevel error -y -i $InputPath -c:v libwebp -quality $Quality -compression_level 6 $OutputPath
    if ($LASTEXITCODE -ne 0) { throw "WebP conversion failed: $InputPath" }
}

function Convert-Loop([string]$InputPath, [string]$OutputPath, [double]$Duration, [double]$FadeSeconds = 1.0) {
    Ensure-Dir (Split-Path -Parent $OutputPath)
    $bodyEnd = $Duration - $FadeSeconds
    $filter = "[0:v]fps=24,trim=start=$FadeSeconds`:end=$bodyEnd,setpts=PTS-STARTPTS[body];[0:v]fps=24,trim=start=$bodyEnd`:end=$Duration,setpts=PTS-STARTPTS[tail];[0:v]fps=24,trim=start=0:end=$FadeSeconds,setpts=PTS-STARTPTS[head];[tail][head]blend=all_expr='A*(1-T/$FadeSeconds)+B*(T/$FadeSeconds)':shortest=1[transition];[body][transition]concat=n=2:v=1:a=0,format=yuv420p[v]"
    & $ffmpeg -hide_banner -loglevel error -y -i $InputPath -filter_complex $filter -map "[v]" -an -c:v libvpx-vp9 -crf 20 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 $OutputPath
    if ($LASTEXITCODE -ne 0) { throw "Loop conversion failed: $InputPath" }
}

$imagesRoot = Join-Path $projectRoot "public\images\core"
$videosRoot = Join-Path $projectRoot "public\videos\menu"

$imageJobs = @(
    @("Original ingredient tokens\ingredient-voidshard.png", "ingredients\ingredient-voidshard.webp", 92),
    @("Original ingredient tokens\ingredient-brimstone.png", "ingredients\ingredient-brimstone.webp", 92),
    @("Original ingredient tokens\ingredient-deathweave.png", "ingredients\ingredient-deathweave.webp", 92),
    @("Original ingredient tokens\ingredient-frostbile.png", "ingredients\ingredient-frostbile.webp", 92),
    @("Original ingredient tokens\ingredient-bloodthorn.png", "ingredients\ingredient-bloodthorn.webp", 92),
    @("Original ingredient tokens\ingredient-plaguedust.png", "ingredients\ingredient-plaguedust.webp", 92),
    @("Original ingredient tokens\ingredient-wraithbloom.png", "ingredients\ingredient-wraithbloom.webp", 92),
    @("Original ingredient tokens\ingredient-shadowmoss.png", "ingredients\ingredient-shadowmoss.webp", 92),
    @("Core economy and gameplay objects\brew-bag.png", "economy\brew-bag.webp", 92),
    @("Core economy and gameplay objects\coin.png", "economy\coin.webp", 92),
    @("Core economy and gameplay objects\flask-empty.png", "economy\flask-empty.webp", 92),
    @("Core economy and gameplay objects\flask-full.png", "economy\flask-full.webp", 92),
    @("Core economy and gameplay objects\rat-stone.png", "economy\rat-stone.webp", 92),
    @("Core economy and gameplay objects\ruby.png", "economy\ruby.webp", 92),
    @("Core economy and gameplay objects\score-marker.png", "economy\score-marker.webp", 92),
    @("Player portrait collection\portrait-hexbrewer.jpg", "characters\portrait-hexbrewer.webp", 90),
    @("Player portrait collection\portrait-the-hollow.jpg", "characters\portrait-the-hollow.webp", 90),
    @("Player portrait collection\portrait-the-seer.jpg", "characters\portrait-the-seer.webp", 90),
    @("Player portrait collection\portrait-the-shade.jpg", "characters\portrait-the-shade.webp", 90),
    @("Player portrait collection\portrait-the-wraith.jpg", "characters\portrait-the-wraith.webp", 90),
    @("Omen card structure\omen-card-back.png", "omens\omen-card-back.webp", 92),
    @("Omen card structure\omen-card-front-blank.png", "omens\omen-card-front-blank.webp", 92),
    @("Spatial main-menu hub rooms\menu-room-central-laboratory.jpg", "rooms\central-laboratory.webp", 90),
    @("Spatial main-menu hub rooms\menu-room-new-game-ritual-chamber.jpg", "rooms\new-game-ritual-chamber.webp", 90),
    @("Spatial main-menu hub rooms\menu-room-grimoire-scriptorium.jpg", "rooms\grimoire-scriptorium.webp", 90),
    @("Spatial main-menu hub rooms\menu-room-dlc-reliquary.jpg", "rooms\dlc-reliquary.webp", 90),
    @("Spatial main-menu hub rooms\menu-room-settings-astrolabe.jpg", "rooms\settings-astrolabe.webp", 90)
)

foreach ($job in $imageJobs) {
    Convert-WebP (Join-Path $SourceRoot $job[0]) (Join-Path $imagesRoot $job[1]) $job[2]
}

$videoJobs = @(
    @("Main-menu central laboratory loop.mp4", "central-laboratory.webm", 10.04),
    @("New Game chamber loop.mp4", "new-game-ritual-chamber.webm", 9.04),
    @("Grimoire scriptorium loop.mp4", "grimoire-scriptorium.webm", 8.04),
    @("DLC reliquary loop.mp4", "dlc-reliquary.webm", 8.04),
    @("Settings astrolabe loop.mp4", "settings-astrolabe.webm", 8.04)
)

foreach ($job in $videoJobs) {
    Convert-Loop (Join-Path $SourceRoot "Background loop videos\$($job[0])") (Join-Path $videosRoot $job[1]) $job[2]
}

Write-Host "Core art integrated into public/images/core and public/videos/menu."
