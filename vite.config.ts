import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
