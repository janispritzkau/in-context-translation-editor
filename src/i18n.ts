import { createI18n } from "vue-i18n";
import { messageCompiler } from "./translation-editor/vue-i18n";

const i18n = createI18n({
  locale: "de",
  fallbackLocale: "en",
  fallbackWarn: false,
  missingWarn: false,
  messageCompiler,
  messages: {
    en: {
      message: {
        youDidIt: "You did it!",
        seeDocs: "Visit {link} to read the documentation",
      },
      car: "car | cars",
      apple: "no apples | one apple | {count} apples",
      banana: "no bananas | {n} banana | {n} bananas",
      tos: "Term of Service",
      term: "I accept xxx {0}.",
      info: "You can {action} until {limit} minutes from departure.",
      change: "change your flight",
      refund: "refund the ticket",
    },
    de: {
      message: {
        youDidIt: "Du hast es geschafft!",
        seeDocs: "Besuche {link}, um die Dokumentation zu lesen",
      },
    },
    ja: {
      tos: "利用規約",
      term: "私は xxx の{0}に同意します。",
    },
  },
});

export default i18n;
