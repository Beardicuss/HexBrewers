# Hexbrewers of Ashenveil — Windows Release Checklist

## Automated release gate

Run:

```powershell
npm ci
npm run release:verify
npm run release:win
```

The installer is written to `release/Hexbrewers of Ashenveil-Setup-0.1.0.exe`.

Current v0.1.0 SHA-256:
`58D676C64FF478F6E05C575B95FF33B3016929694453751C6D7E61B0A146F1F5`

## Manual release-candidate checks

- Install to the default folder and to a custom folder.
- Confirm the desktop and Start Menu shortcuts launch the game.
- Complete one match after installation and confirm save/resume survives an app restart.
- Check English, Russian, and Georgian at 1920×1080 and 1366×768.
- Confirm audio sliders, reduced-motion behavior, and fullscreen/window resizing.
- Uninstall from Windows Settings and confirm shortcuts are removed.
- Scan the unsigned installer before distribution.

## Signing and publishing

The generated installer is unsigned. For public distribution, sign the installer and
application executable with a trusted Windows code-signing certificate before upload.
Record the SHA-256 checksum alongside every published build.
