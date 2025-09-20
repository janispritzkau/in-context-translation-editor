import "./style.css";

import { createApp, ref } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";

export const loaded = ref(false);

const app = createApp(App);

app.use(i18n);
app.use(router);

app.mount("#app");

export async function load() {
  const module = await import("./_async");
  loaded.value = true;
  return module;
}
