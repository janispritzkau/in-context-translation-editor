import { compile as defaultCompile, type MessageFunctionReturn } from "@intlify/core-base";
import type { Ref } from "vue";
import type { MessageCompiler, MessageContext, VueMessageType } from "vue-i18n";
import { messageMapper, type MessageMapper } from "../core/messages";
import { isEnabled } from "./global";

export interface MessageCompilerOptions {
  isEnabled: Readonly<Ref<boolean>>;
  compile?: MessageCompiler<VueMessageType>;
  mapper?: MessageMapper;
}

export function createMessageCompiler(
  options: MessageCompilerOptions,
): MessageCompiler<VueMessageType> {
  const { isEnabled, compile = defaultCompile, mapper = messageMapper } = options;

  return (message, context) => {
    const translate = compile(message, context);
    if (isEnabled.value == false) return translate;

    return (ctx: MessageContext<VueMessageType>): MessageFunctionReturn<VueMessageType> => {
      const values: Record<string, unknown> = {};
      for (const key in ctx.values) {
        const value = ctx.values[key];
        const id = mapper.variableId(key, context.key);
        const prefix = mapper.prefixWithType("variable");
        const suffix = mapper.suffixWithId(id, "variable");
        if (typeof value === "string" || typeof value === "number") {
          values[key] = prefix + value + suffix;
        } else if (Array.isArray(value)) {
          values[key] = [prefix, ...(value as unknown[]), suffix];
        } else {
          values[key] = [prefix, value, suffix];
        }
      }
      console.log("values", values);

      const translated = translate({
        ...ctx,
        named: (key) => values[key],
        list: (index) => values[index.toString()],
        values,
      });

      const id = mapper.messageId(context.key);
      const prefix = mapper.prefixWithType("message");
      const suffix = mapper.suffixWithId(id, "message");

      return typeof translated == "string"
        ? prefix + translated + suffix
        : // @ts-expect-error type issue in vue-i18n
          [prefix, ...translated, suffix];
    };
  };
}

export const messageCompiler = createMessageCompiler({ isEnabled });
