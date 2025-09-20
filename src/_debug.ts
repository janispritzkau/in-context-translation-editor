import { isMessageAST, resolveValue } from "@intlify/core-base";
import { traverseMessages, type MessageRange } from "./components/TranslationTool/messages";
import i18n from "./i18n";

export function* walkMessages() {
  function* walkMessage(message: MessageRange): Generator<unknown> {
    select(message.range);
    yield {
      type: "message",
      key: message.key,
      message: getMessage(message.key),
      text: message.range.toString(),
    };
    for (const value of message.values) {
      select(value.range);
      yield { type: "value", key: value.value, text: value.range.toString() };
      for (const message of value.messages) yield* walkMessage(message);
    }
  }
  for (const message of traverseMessages()) yield* walkMessage(message);
}

export function getMessage(key: string) {
  const value = resolveValue(i18n.global.getLocaleMessage(i18n.global.locale.value), key);
  if (isMessageAST(value)) return value.loc?.source ?? key;
  return value?.toString() ?? key;
}

export function select(range: Range) {
  const selection = getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}
