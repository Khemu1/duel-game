import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:4005",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
