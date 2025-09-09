import { applyPatch, formatPatch, parsePatch, structuredPatch } from "diff";
import type { MaybePromise } from "../utils";

export interface CreateDiffOptions {
  getFile: (fileName: string) => MaybePromise<string | null>;
  getPatch: (fileName: string) => MaybePromise<CreatePatchFunction>;
  patchOptions?: Pick<CreatePatchOptions, "sort" | "diff">;
}

export async function createDiff(
  modifiedByFile: Record<string, Record<string, string>>,
  options: CreateDiffOptions,
): Promise<string> {
  const patches = await Promise.all(
    Object.keys(modifiedByFile).map(async (fileName) => {
      const [original, createPatch] = await Promise.all([
        options.getFile(fileName),
        options.getPatch(fileName),
      ]);
      if (original == null) return "";
      const messages = modifiedByFile[fileName]!;
      return createPatch(fileName, original, messages, options.patchOptions);
    }),
  );
  return patches.join("");
}

export interface ApplyDiffOptions {
  getFile: (fileName: string) => MaybePromise<string | null>;
}

export async function applyDiff(
  diff: string,
  options: ApplyDiffOptions,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const patch of parsePatch(diff)) {
    const file = await options.getFile(patch.oldFileName);
    if (file == null) continue;
    const patched = applyPatch(file, formatPatch(patch));
    if (patched != false) result[patch.oldFileName] = patched;
  }
  return result;
}

export type CreatePatchFunction = (
  fileName: string,
  original: string,
  modified: Record<string, string>,
  options?: CreatePatchOptions,
) => Promise<string>;

export interface CreatePatchOptions {
  sort?: boolean | ((x: string, y: string) => number);
  format?: (str: string) => Promise<string> | string;
  diff?: (fileName: string, oldStr: string, newStr: string) => string;
}

export const defaultDiff = (context: number) => {
  return function diff(fileName: string, oldStr: string, newStr: string): string {
    const patch = structuredPatch(fileName, fileName, oldStr, newStr, "", "", { context });
    return formatPatch(patch).replace(/^.+\n=+\n/, "");
  };
};

export const defaultCompare = function sortCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
};
