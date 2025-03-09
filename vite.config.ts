import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        description:
          "Simple stop motion movie maker. No accounts, no ads, all saved to only your device.",
        name: "Animation time",
        screenshots: [
          {
            src: "screenshots/get-started.png",
            sizes: "631x565",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "screenshots/scenes.png",
            sizes: "631x565",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  base: "/onion/",
  build: {
    // Was getting a whole bunch of "Module level directives cause errors when bundled, "use client" in ... was ignored.
    // Made the build very noisy.
    // https://stackoverflow.com/a/76694634
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
});
