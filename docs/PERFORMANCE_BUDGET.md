# Presentation performance budget

These limits keep the web build and packaged desktop build responsive as new artwork is added.

| Asset class | Per-file limit | Runtime rule |
| --- | ---: | --- |
| Critical title logo | 150 KiB | WebP/AVIF, immediately available |
| Loading poster | 850 KiB | 1920×1080 WebP, only one decoded at a time |
| Other image | 1.2 MiB | Prefer WebP; load with the owning screen |
| Sound effect | 1 MiB | Ogg Opus, decoded on first use |
| Music track | 6 MiB | Ogg Opus, decoded on demand; one active track |
| Video | 12 MiB | VP9 WebM, poster fallback, no eager off-screen loading |
| Entire `public` folder | 80 MiB | Checked in CI/release verification |

Run `npm run check:assets` whenever presentation assets are added or replaced.

Startup must not preload the complete audio library. New-game loading should fetch only the common board presentation plus assets belonging to enabled modules.
