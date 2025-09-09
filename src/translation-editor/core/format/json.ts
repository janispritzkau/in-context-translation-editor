import { defaultCompare, defaultDiff, type CreatePatchOptions } from "../patch";

export interface CreateJsonPatchOptions extends CreatePatchOptions {
  parse?: (str: string) => unknown;
  stringify?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    replacer?: ((this: any, key: string, value: any) => any) | null,
    space?: string | number | null,
  ) => string;
}

export async function createJsonPatch(
  fileName: string,
  originalStr: string,
  modified: Record<string, string>,
  options: CreateJsonPatchOptions = {},
): Promise<string> {
  const { parse = JSON.parse, stringify = JSON.stringify, sort = true } = options;

  const compare = typeof sort == "function" ? sort : defaultCompare;
  const original = parse(originalStr);

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

  const modifiedStr = stringify(original, undefined, 2) + "\n";
  const formattedStr = (await options.format?.(modifiedStr)) ?? modifiedStr;

  const diff = options.diff ?? defaultDiffJson;
  return diff(fileName, originalStr, formattedStr);
}

const defaultDiffJson = defaultDiff(2);
