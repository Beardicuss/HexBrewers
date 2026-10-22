param(
    [Parameter(Mandatory = $true)]
    [string]$SoftcurseMaster,

    [Parameter(Mandatory = $true)]
    [string]$TrailerMaster,

    [Parameter(Mandatory = $true)]
    [string]$NarrationMaster,

    [string]$Ffmpeg = "ffmpeg"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$introDirectory = Join-Path $projectRoot "public\videos\intro"
$softcurseOutput = Join-Path $introDirectory "softcurse-ident.webm"
$trailerOutput = Join-Path $introDirectory "ashenveil-trailer.webm"

foreach ($source in @($SoftcurseMaster, $TrailerMaster, $NarrationMaster)) {
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Missing source asset: $source"
    }
}

New-Item -ItemType Directory -Force -Path $introDirectory | Out-Null

& $Ffmpeg -y -i $SoftcurseMaster `
    -map 0:v:0 -map 0:a:0 `
    -c:v libvpx-vp9 -pix_fmt yuv420p -crf 16 -b:v 0 `
    -deadline good -cpu-used 1 -row-mt 1 -tile-columns 2 -threads 8 `
    -c:a libopus -b:a 160k -ar 48000 `
    $softcurseOutput
if ($LASTEXITCODE -ne 0) { throw "Softcurse ident encode failed with exit code $LASTEXITCODE" }

$filter = "[0:v]tpad=start_mode=add:start_duration=3:color=black:stop_mode=add:stop_duration=4.87:color=black,trim=duration=27.91,setpts=PTS-STARTPTS[v];" +
          "[0:a]volume=0.24,adelay=3000|3000,aresample=48000[atmos];" +
          "[1:a]loudnorm=I=-18:TP=-2:LRA=7,adelay=2000|2000,aresample=48000[voice];" +
          "[atmos][voice]amix=inputs=2:duration=longest:dropout_transition=0,apad=pad_dur=2.5,atrim=duration=27.91[a]"

& $Ffmpeg -y -i $TrailerMaster -i $NarrationMaster `
    -filter_complex $filter -map "[v]" -map "[a]" `
    -c:v libvpx-vp9 -pix_fmt yuv420p -crf 16 -b:v 0 `
    -deadline good -cpu-used 1 -row-mt 1 -tile-columns 2 -threads 8 `
    -c:a libopus -b:a 192k -ar 48000 `
    $trailerOutput
if ($LASTEXITCODE -ne 0) { throw "Trailer encode failed with exit code $LASTEXITCODE" }

Write-Host "Rebuilt high-quality intro videos in $introDirectory"
