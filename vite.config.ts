import { fileURLToPath, URL } from "node:url";

import { defineConfig, Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import vueI18n from "@intlify/unplugin-vue-i18n/vite";
import tailwindcss from "@tailwindcss/vite";
import YAML from "yaml";
import JSON5 from "json5";

function yaml(): Plugin {
  return {
    name: "transform-yaml",
    transform(src, id) {
      if (!id.endsWith(".yml") && !id.endsWith(".yaml")) return;
      return { code: `export default ${JSON.stringify(YAML.parse(src))};` };
    },
  };
}

function json5(): Plugin {
  return {
    name: "transform-json5",
    transform(src, id) {
      if (!id.endsWith(".json5")) return;
      return { code: `export default ${JSON.stringify(JSON5.parse(src))};` };
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    vueI18n({
      dropMessageCompiler: false,
    }),
    tailwindcss(),
    yaml(),
    json5(),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
