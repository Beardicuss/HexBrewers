import { createReadStream, existsSync, statSync } from "node:fs";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_ASSET_ORIGIN = "https://pub-7b92547fbe944d259e437d18c1c425d4.r2.dev/releases/20261024-complete";
const MEDIA_DIRECTORIES = ["images", "videos", "music", "sounds", "audio"] as const;
const LOCAL_SOFTCURSE_VIDEO = "D:/Dev/Assets/videos/Videos Intro/softcurse-systems.mp4";

function externalMediaAssets(): Plugin {
  const assetOrigin = (process.env.VITE_ASSET_ORIGIN || DEFAULT_ASSET_ORIGIN).replace(/\/$/, "");
  const mediaPath = /(["'`])\/(images|videos|music|sounds|audio)\//g;
  const hasMediaPath = /["'`]\/(images|videos|music|sounds|audio)\//;
  const rewrite = (source: string) => source.replace(mediaPath, `$1${assetOrigin}/$2/`);
  let isBuild = false;

  return {
    name: "hexbrewers-external-media-assets",
    // Local development must use the checked-out media so gameplay remains
    // testable even when R2 is unavailable. Production builds still rewrite
    // media URLs to the release bucket and omit duplicated media from dist.
    enforce: "pre",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    configureServer(server) {
      // Production receives this original-quality ident from R2. Keep local
      // development faithful without duplicating the large source in Git.
      server.middlewares.use("/videos/intro/softcurse-systems.mp4", (request, response, next) => {
        if (!existsSync(LOCAL_SOFTCURSE_VIDEO)) return next();
        const size = statSync(LOCAL_SOFTCURSE_VIDEO).size;
        const range = request.headers.range?.match(/bytes=(\d*)-(\d*)/);
        response.setHeader("Content-Type", "video/mp4");
        response.setHeader("Accept-Ranges", "bytes");
        if (range) {
          const start = range[1] ? Number(range[1]) : 0;
          const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
          if (start > end || start >= size) {
            response.statusCode = 416;
            response.setHeader("Content-Range", `bytes */${size}`);
            return response.end();
          }
          response.statusCode = 206;
          response.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
          response.setHeader("Content-Length", end - start + 1);
          return createReadStream(LOCAL_SOFTCURSE_VIDEO, { start, end }).pipe(response);
        }
        response.statusCode = 200;
        response.setHeader("Content-Length", size);
        return createReadStream(LOCAL_SOFTCURSE_VIDEO).pipe(response);
      });
    },
    transform(source, id) {
      return isBuild && /\.(?:[cm]?[jt]sx?|css)$/.test(id) && hasMediaPath.test(source)
        ? { code: rewrite(source), map: null }
        : null;
    },
    transformIndexHtml(source) {
      return isBuild ? rewrite(source) : source;
    },
    async closeBundle() {
      if (isBuild) {
        await Promise.all(MEDIA_DIRECTORIES.map((directory) => rm(resolve("dist", directory), { recursive: true, force: true })));
      }
    },
  };
}

export default defineConfig({
  plugins: [externalMediaAssets(), react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
