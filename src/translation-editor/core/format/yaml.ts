import { isMap, parse, parseDocument, YAMLMap } from "yaml";
import { defaultCompare, defaultDiff, type CreatePatchOptions } from "../patch";

export type CreateYamlPatchOptions = CreatePatchOptions;

export async function createYamlPatch(
  fileName: string,
  originalStr: string,
  modified: Record<string, string>,
  options: CreateYamlPatchOptions = {},
): Promise<string> {
  const { sort = true } = options;

  const document = parseDocument(originalStr);
  const compare = typeof sort == "function" ? sort : defaultCompare;

  const insert = <T>(map: YAMLMap, key: string, value: T): T => {
    if (sort && !map.has(key)) {
      const index = map.items.findIndex((item) => compare(item.key as string, key) > 0);
      if (index == -1) map.add(document.createPair(key, value));
      else map.items.splice(index, 0, document.createPair(key, value));
    } else {
      map.set(key, value);
    }
    return value;
  };

  for (const [path, value] of Object.entries(modified)) {
    const keys = path.split(".");
    let map = document.contents as YAMLMap;
    let key = keys.shift()!;

    while (keys.length > 0) {
      const value = map.get(key);
      if (isMap(value)) map = value;
      else map = insert(map, key, new YAMLMap());
      key = keys.shift()!;
    }

    insert(map, key, value);
  }

  const modifiedStr = document.toString();
  const formattedStr = (await options.format?.(modifiedStr)) ?? modifiedStr;

  const diff = options.diff ?? defaultDiffYaml;
  return diff(fileName, originalStr, formattedStr);
}

const defaultDiffYaml = defaultDiff(1);

export { parse as parseYaml };
