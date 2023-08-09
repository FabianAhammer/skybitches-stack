// Plugins
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Utilities
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default ({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()))
  return defineConfig({
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
        styles: {
          configFile: "src/styles/settings.scss",
        },
      }),
    ],
    define: {
      "process.env": {}
    },
    resolve: {
      alias: [
        { find: "@", replacement: fileURLToPath(new URL("src", import.meta.url)) },
      ],
      extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
    },
    server: {
      port: parseInt(process.env.VITE_SERVER_PORT || "3002"),
      proxy: {
        "/api": {
          target: "http://localhost:3000/api/",
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/socket": {
          target: "http://localhost:3001/socket/",
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
          rewrite: (path) => path.replace(/^\/socket/, ""),
        },
      },
    }
  });

}
