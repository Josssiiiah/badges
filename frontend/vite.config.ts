import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { PluginOption } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname),            // point root at frontend/
  publicDir: path.resolve(__dirname, "public"), // point publicDir at frontend/public
  build: {
    outDir: path.resolve(__dirname, "../backend/dist"), // emit into backend/dist
    emptyOutDir: false,     // so you don’t wipe your server’s HTML/JS
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});