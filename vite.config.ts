import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: false, //👈
    proxy: {
      "/workflow-api": {
        target: "http://10.10.10.34:8081",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("workflow proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Workflow Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Workflow Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
        rewrite: (path) => path.replace(/^\/workflow-api/, "/workflows"),
      },
      "/api": {
        target: "http://10.10.10.34:8081",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
        rewrite: (path) => path.replace(/^\/api/, "/chatbot"),
      },
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
