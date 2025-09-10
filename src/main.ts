import "./style.css";

import { createApp, nextTick } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";
import { traverseMessages, type MessageRange } from "./translation-editor/core/dom";

const app = createApp(App);

app.use(i18n);
app.use(router);

app.mount("#app");

import("./_async");

function mapMessage(message: MessageRange) {
  return {
    text: message.range.toString(),
    ...message,
    variables: message.variables.map((v) => ({
      text: v.range.toString(),
      ...v,
    })),
  };
}

router.afterEach(() => {
  nextTick(() => {
    console.log([...traverseMessages()].map(mapMessage));
  });
});
