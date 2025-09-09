import {
  applyDiff,
  createDiff,
  createJsonPatch,
  type CreatePatchFunction,
} from "./translation-editor/core";

const messages = import.meta.glob("./*", {
  query: "?raw",
  base: "./locales",
  import: "default",
});

async function exampleDiff() {
  const getFile = (fileName: string) => (messages[fileName]?.() as Promise<string>) ?? null;
  const getPatch = async (fileName: string) =>
    fileName.endsWith(".yaml")
      ? import("./translation-editor/core/format/yaml").then((m) => m.createYamlPatch)
      : fileName.endsWith(".json5")
        ? import("json5").then(
            ({ default: JSON5 }): CreatePatchFunction =>
              (fileName, original, modified, options) =>
                createJsonPatch(fileName, original, modified, {
                  ...options,
                  parse: JSON5.parse,
                  stringify: (value) => JSON5.stringify(value, { space: 2, quote: '"' }),
                }),
          )
        : createJsonPatch;

  const modified = {
    "./en.json": { "message.test": "This is a test", a: "first", z: "last" },
    "./de.yaml": { "z.b": "ZB", "z.a": "ZA", "message.hello": "Hallo!", note: "Notiz" },
    "./jp.json5": { "new.key": "新しい値" },
  };

  const diff = await createDiff(modified, { getFile, getPatch });
  console.log(diff);

  const patched = await applyDiff(diff, { getFile });
  console.log(patched);
}

exampleDiff();
