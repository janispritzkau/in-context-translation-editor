import i18n from "./i18n";
import {
  applyDiff,
  createDiff,
  createJsonPatch,
  createYamlPatch,
  parseJson,
  parseYaml,
} from "./translation-editor/core";

const messages = import.meta.glob("./*", {
  query: "?raw",
  base: "./locales",
  import: "default",
});

async function exampleDiff() {
  const getFile = (fileName: string) => (messages[fileName]?.() as Promise<string>) ?? null;
  const getPatch = (fileName: string) =>
    fileName.endsWith(".json") ? createJsonPatch : createYamlPatch;

  const modified = {
    "./en.json": { "message.test": "This is a test", a: "first", z: "last" },
    "./de.yaml": { "z.b": "ZB", "z.a": "ZA", "message.hello": "Hallo!", note: "Notiz" },
  };

  const diff = await createDiff(modified, { getFile, getPatch });
  console.log(diff);

  const patched = await applyDiff(diff, { getFile });
  console.log(patched);

  const localeMessages: Record<string, Record<string, string>> = {};

  for (const fileName in patched) {
    const locale = fileName.slice(fileName.indexOf("/") + 1, fileName.lastIndexOf("."));
    if (fileName.endsWith(".json")) {
      localeMessages[locale] = parseJson(patched[fileName]!) as Record<string, string>;
    } else {
      localeMessages[locale] = parseYaml(patched[fileName]!) as Record<string, string>;
    }
  }

  i18n.global.setLocaleMessage("qtt", localeMessages[i18n.global.locale.value] ?? {});
  i18n.global.locale.value = "qtt";
  console.log(localeMessages);
}

exampleDiff();
