import { compile, type LocaleMessage, type MessageCompiler } from "@intlify/core-base";
import { shallowRef } from "vue";
import { createI18n, type VueMessageType } from "vue-i18n";
import en from "./locales/en.yaml";

const messageCompiler = shallowRef<MessageCompiler<VueMessageType>>(compile);

export function setMessageCompiler(compiler: MessageCompiler<VueMessageType>) {
  messageCompiler.value = compiler;
}

const i18n = createI18n({
  legacy: false,
  locale: "de",
  fallbackLocale: "en",
  fallbackFormat: true,
  missingWarn: false,
  fallbackWarn: false,
  messageCompiler: (message, context) => {
    return messageCompiler.value(message, context);
  },
  messages: { en } as Record<string, LocaleMessage<VueMessageType>>,
});

export default i18n;

export const messagesLoaded = import("@intlify/unplugin-vue-i18n/messages").then((module) => {
  const messages = module.default;
  for (const locale in messages) {
    i18n.global.setLocaleMessage(locale, messages[locale]);
  }
});
