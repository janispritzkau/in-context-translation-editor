import { type MessageFunctionReturn, compile as defaultCompile } from "@intlify/core-base";
import type { MessageCompiler, MessageContext, VueMessageType } from "vue-i18n";
import { activated } from ".";

export type Messages = { [key: string]: string | Messages };

export function isMessages(input: unknown): input is Messages {
  if (!isObject(input)) return false;
  for (const key in input) {
    const value = input[key];
    if (typeof value === "string") continue;
    if (isObject(value)) {
      if (!isMessages(value)) return false;
      continue;
    }
    return false;
  }
  return true;
}

export function validateMessages(input: unknown): Messages {
  if (isMessages(input)) return input;
  throw new Error("Invalid messages format");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value == "object" && !Array.isArray(value);
}

export const messageCompiler: MessageCompiler<VueMessageType> = import.meta.env.SSR
  ? defaultCompile
  : createMessageCompiler();

export function createMessageCompiler(
  compile: MessageCompiler<VueMessageType> = defaultCompile,
): MessageCompiler<VueMessageType> {
  return (message, context) => {
    const translate = compile(message, context);
    if (activated.value == false) return translate;

    return (ctx: MessageContext<VueMessageType>): MessageFunctionReturn<VueMessageType> => {
      const values: Record<string, unknown> = {};
      for (const key in ctx.values) {
        const value = ctx.values[key];
        const prefix = PREFIX + TYPE_VALUE;
        const suffix = SUFFIX + keyToId(key);
        values[key] = Array.isArray(value)
          ? [prefix, ...(value as unknown[]), suffix]
          : prefix + value + suffix;
      }

      const translated = translate({
        ...ctx,
        named: (key) => values[key],
        list: (index) => values[index.toString()],
        values,
      });

      const prefix = PREFIX + TYPE_MESSAGE;
      const suffix = SUFFIX + keyToId(context.key);

      return typeof translated == "string"
        ? prefix + translated + suffix
        : // @ts-expect-error type issue in vue-i18n
          [prefix, ...translated, suffix];
    };
  };
}

export function* traverseMessages(root: Node = document.body): Generator<MessageRange> {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  const stack: {
    range: Range;
    valueRange?: Range;
    valueMessages: MessageRange[];
    values: MessageValueRange[];
  }[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const isTextNode = node instanceof Text;

    let text: string;
    if (isTextNode) {
      text = node.data;
    } else if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      text = node.value || node.placeholder;
    } else {
      continue;
    }

    let offset = 0;
    while (true) {
      const prefixIndex = text.indexOf(PREFIX, offset);
      const suffixIndex = text.indexOf(SUFFIX, offset);
      if (prefixIndex == -1 && suffixIndex == -1) break;

      const isPrefixFirst = prefixIndex != -1 && (prefixIndex < suffixIndex || suffixIndex == -1);
      const isSuffixFirst = suffixIndex != -1 && (suffixIndex < prefixIndex || prefixIndex == -1);

      if (isPrefixFirst) {
        offset = prefixIndex + PREFIX.length + 1;

        const range = document.createRange();
        if (isTextNode) range.setStart(node, prefixIndex);
        else range.selectNode(node);

        if (text[prefixIndex + PREFIX.length] == TYPE_MESSAGE) {
          stack.push({ range: range, values: [], valueMessages: [] });
        } else if (text[prefixIndex + PREFIX.length] == TYPE_VALUE) {
          const message = stack[stack.length - 1];
          if (message) message.valueRange = range;
        }
      }

      if (isSuffixFirst) {
        offset = suffixIndex + SUFFIX.length + 8;

        const last = stack.pop();
        if (!last) continue;

        const range = last.valueRange ?? last.range;
        if (isTextNode) range.setEnd(node, suffixIndex + SUFFIX.length);

        const id = text.slice(suffixIndex + SUFFIX.length).slice(0, 8);

        if (last.valueRange) {
          const value: MessageValueRange = { range, value: idToKey(id), messages: [] };
          if (last.valueMessages) {
            value.messages = last.valueMessages;
            last.valueMessages = [];
          }
          last.values.push(value);
          delete last.valueRange;
          stack.push(last);
        } else {
          const message: MessageRange = { range, key: idToKey(id), values: last.values };
          const parent = stack[stack.length - 1];
          if (parent) parent.valueMessages.push(message);
          else yield message;
        }
      }
    }
  }
}

export interface MessageRange {
  range: Range;
  key: string;
  values: MessageValueRange[];
}

export interface MessageValueRange {
  range: Range;
  value: string;
  messages: MessageRange[];
}

const SEEN_KEYS: string[] = [];

function keyToId(key: string) {
  let index = SEEN_KEYS.indexOf(key);
  if (index == -1) {
    SEEN_KEYS.push(key);
    index = SEEN_KEYS.length - 1;
  }
  return [...index.toString(3)]
    .map((c) => "\u200b\u200c\u200d"[+c])
    .join("")
    .padStart(8, "\u200b");
}

function idToKey(id: string) {
  const index = [...id].reduce((acc, c) => acc * 3 + "\u200b\u200c\u200d".indexOf(c), 0);
  return SEEN_KEYS[index];
}

const PREFIX = `\u200c\u200d`;
const SUFFIX = `\u200d\u200c`;

const TYPE_MESSAGE = "\u200b";
const TYPE_VALUE = "\u200c";
