import { createI18n } from "vue-i18n";
import { messageCompiler } from "./translation-editor/vue-i18n";
import messages from "@intlify/unplugin-vue-i18n/messages";

const i18n = createI18n({
  legacy: false,
  locale: "de",
  fallbackLocale: "en",
  fallbackWarn: false,
  missingWarn: false,
  messageCompiler,
  messages,
});

export default i18n;
