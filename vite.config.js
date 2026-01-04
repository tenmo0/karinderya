import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/PROGRAM/", // GitHub repo name

  plugins: [react()],

  server: {
    proxy: {
      "/reserve": {
        target: "http://192.168.18.3:5000",
        changeOrigin: true,
      },
      "/ulams": {
        target: "http://192.168.18.3:5000",
        changeOrigin: true,
      },
      "/images": {
        target: "http://192.168.18.3:5000",
        changeOrigin: true,
      },
    },
  },
});
