import { createI18n, type VueMessageType } from "vue-i18n";
import { messageCompiler } from "./translation-editor/vue-i18n";

const messagesByFile = import.meta.glob("./*", {
  eager: true,
  import: "default",
  base: "./locales",
}) as Record<string, Record<string, VueMessageType>>;

const messages: Record<string, Record<string, VueMessageType>> = {};
for (const path in messagesByFile) {
  const locale = path.slice(path.indexOf("/") + 1, path.lastIndexOf("."));
  messages[locale] = messagesByFile[path] as Record<string, VueMessageType>;
}

const i18n = createI18n({
  legacy: false,
  locale: "jp",
  fallbackLocale: ["de", "en"],
  fallbackWarn: false,
  missingWarn: false,
  messageCompiler,
  messages,
});

export default i18n;
