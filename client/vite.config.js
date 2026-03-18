import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/busData": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
