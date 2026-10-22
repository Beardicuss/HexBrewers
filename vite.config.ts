import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_ASSET_ORIGIN = "https://pub-7b92547fbe944d259e437d18c1c425d4.r2.dev/releases/b9d0faa";
const MEDIA_DIRECTORIES = ["images", "videos", "music", "sounds", "audio"] as const;

function externalMediaAssets(): Plugin {
  const assetOrigin = (process.env.VITE_ASSET_ORIGIN || DEFAULT_ASSET_ORIGIN).replace(/\/$/, "");
  const mediaPath = /(["'`])\/(images|videos|music|sounds|audio)\//g;
  const hasMediaPath = /["'`]\/(images|videos|music|sounds|audio)\//;
  const rewrite = (source: string) => source.replace(mediaPath, `$1${assetOrigin}/$2/`);

  return {
    name: "hexbrewers-external-media-assets",
    enforce: "pre",
    transform(source, id) {
      return /\.(?:[cm]?[jt]sx?|css)$/.test(id) && hasMediaPath.test(source)
        ? { code: rewrite(source), map: null }
        : null;
    },
    transformIndexHtml: rewrite,
    async closeBundle() {
      await Promise.all(MEDIA_DIRECTORIES.map((directory) => rm(resolve("dist", directory), { recursive: true, force: true })));
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
