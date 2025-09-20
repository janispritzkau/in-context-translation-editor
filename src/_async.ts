import yaml from "yaml";
import * as debug from "./_debug";
import { createJsonPatch, createYamlPatch, messageCompiler } from "./components/TranslationTool";
import { applyDiff, createDiff } from "./components/TranslationTool/patch";
import i18n, { setMessageCompiler } from "./i18n";

export { default as TranslationTool } from "./components/TranslationTool";

if (import.meta.env.DEV) {
  Object.assign(globalThis, debug);
}

setMessageCompiler(messageCompiler);

const messages = import.meta.glob("./*", {
  query: "?raw",
  base: "./locales",
  import: "default",
});

import DIFF from "../1.diff?raw";

async function exampleDiff() {
  const getFile = (fileName: string) => (messages[fileName]() as Promise<string>) ?? null;
  const getPatch = (fileName: string) =>
    fileName.endsWith(".json") ? createJsonPatch : createYamlPatch;

  const modified = {
    "./en.yaml": { "message.test": "This is a test", a: "first", z: "last" },
    "./de.json": { a: "A", "z.b": "ZB", "z.a": "ZA", german: "Deutsch!", search: "Suchen..." },
  };

  const diff = await createDiff(modified, { getFile, getPatch });
  console.log(diff);

  const patched = await applyDiff(DIFF, { getFile });
  console.log(patched);

  const localeMessages: Record<string, Record<string, string>> = {};

  for (const fileName in patched) {
    const locale = fileName.slice(fileName.indexOf("/") + 1, fileName.lastIndexOf("."));
    if (fileName.endsWith(".json")) {
      localeMessages[locale] = JSON.parse(patched[fileName]);
    } else {
      localeMessages[locale] = yaml.parse(patched[fileName]);
    }
  }

  i18n.global.setLocaleMessage("qtt", localeMessages[i18n.global.locale.value] ?? {});
  i18n.global.locale.value = "qtt";
  console.log(localeMessages);
}

exampleDiff();
