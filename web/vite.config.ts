import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "../electron/dist/web/dist", // Output frontend build to Electron folder
    emptyOutDir: true,
  },
});
