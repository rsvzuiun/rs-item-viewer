import { defineConfig } from "vite-plus";
import { VitePluginRadar } from "vite-plugin-radar";

export default defineConfig({
  lint: {
    overrides: [
      {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["public/**/*"],
  },
  staged: { "*": "vp check --fix" },
  base: "/rs-item-viewer/",
  plugins: [
    VitePluginRadar({
      analytics: { id: "G-CG5RH7CYFD" },
    }),
  ],
});
