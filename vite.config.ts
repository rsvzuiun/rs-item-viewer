import { defineConfig } from "vite-plus";
import { VitePluginRadar } from "vite-plugin-radar";

export default defineConfig({
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
  },
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
