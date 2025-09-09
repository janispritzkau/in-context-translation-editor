import { createI18n } from "vue-i18n";

const i18n = createI18n({
  locale: "en",
  messages: {
    en: {
      message: {
        hello: "Hello world!",
      },
    },
  },
});

export default i18n;
