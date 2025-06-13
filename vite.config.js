import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
const LOCAL_IP = "192.168.0.200";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // <--- Thêm dòng này!
    proxy: {
      "/api": {
        // target: "http://localhost:5000",
        target: `http://${LOCAL_IP}:5000`,
        changeOrigin: true,
      },
    },
  },
});
