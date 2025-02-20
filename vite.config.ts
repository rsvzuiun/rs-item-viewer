import { defineConfig } from "vite";
import { VitePluginRadar } from "vite-plugin-radar";

export default defineConfig({
  build: {
    target: ["es2022", "edge89", "firefox89", "chrome89", "safari15"],
  },
  base: "/rs-item-viewer/",
  plugins: [
    VitePluginRadar({
      analytics: { id: "G-CG5RH7CYFD" },
    }),
  ],
});
