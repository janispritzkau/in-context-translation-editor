import { defaultCompare, defaultDiff, type CreatePatchOptions } from "./patch";

export async function createJsonPatch(
  fileName: string,
  originalStr: string,
  modified: Record<string, string>,
  options: CreatePatchOptions = {},
): Promise<string> {
  const { sort = true } = options;

  const compare = typeof sort == "function" ? sort : defaultCompare;
  const original = JSON.parse(originalStr);

  const insert = (obj: Record<string, unknown>, key: string, value: unknown) => {
    let tmp: Record<string, unknown> | undefined;

    if (sort) {
      for (const k in obj) {
        if (!tmp && compare(k, key) <= 0) continue;
        tmp ??= {};
        tmp[k] = obj[k];
        delete obj[k];
      }
    }

    obj[key] = value;
    for (const k in tmp) obj[k] = tmp[k];

    return value;
  };

  for (const [path, value] of Object.entries(modified)) {
    const keys = path.split(".");
    let obj = original;
    let key = keys.shift()!;

    while (keys.length > 0) {
      obj = key in obj ? obj[key] : insert(obj, key, {});
      key = keys.shift()!;
    }

    insert(obj, key, value);
  }

  const modifiedStr = JSON.stringify(original, null, 2) + "\n";
  const formattedStr = (await options.format?.(modifiedStr)) ?? modifiedStr;

  const diff = options.diff ?? defaultDiffJson;
  return diff(fileName, originalStr, formattedStr);
}

export function parseJson(str: string): unknown {
  return JSON.parse(str);
}

const defaultDiffJson = defaultDiff(2);
