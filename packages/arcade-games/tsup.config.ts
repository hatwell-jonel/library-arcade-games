import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom"],
    outDir: "dist",
    esbuildOptions(options) {
        options.loader = {
        ...options.loader,
        ".css": "css",
        };
    },
});
