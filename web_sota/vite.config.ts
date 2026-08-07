import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    host: "127.0.0.1",
    port: 11103,
    proxy: {
      "/api": "http://127.0.0.1:11102",
      "/docs": { target: "http://127.0.0.1:11102", changeOrigin: true },
      "/openapi.json": { target: "http://127.0.0.1:11102", changeOrigin: true },
      "/redoc": { target: "http://127.0.0.1:11102", changeOrigin: true },
    },
  },
});
