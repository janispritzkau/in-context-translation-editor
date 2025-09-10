export interface MessageMapper {
  prefix: string;
  suffix: string;
  messageId(message: MessageKey): number;
  messageById(id: number): MessageKey | null;
  variableId(variable: string, messageId: number): number;
  variableById(id: number, messageId: number): VariableKey | null;
  writePrefix(type: KeyType): string;
  writeSuffix(id: number, type: KeyType): string;
  readPrefix(input: string): { type: KeyType; length: number } | null;
  readSuffix(input: string, type: KeyType): { id: number; length: number } | null;
  messages(): IterableIterator<MessageKey>;
  variables(messageId: number): IterableIterator<VariableKey>;
  reset(): void;
}

export type KeyType = "message" | "variable";
export type MessageKey = { locale: string; message: string };
export type VariableKey = { variable: string };

export interface MessageMapperOptions {
  prefix?: string;
  suffix?: string;
  writeType?(type: KeyType): string;
  readType?(input: string): { type: KeyType; length: number } | null;
  writeId?(id: number, length: number): string;
  readId?(input: string, length: number): number | null;
}

export function createMessageMapper(options: MessageMapperOptions = {}): MessageMapper {
  const {
    prefix = PREFIX,
    suffix = SUFFIX,
    writeType = defaultWriteType,
    readType = defaultReadType,
    writeId = defaultWriteId,
    readId = defaultReadId,
  } = options;

  let locales: string[] = [];
  let messagesByLocale: Record<number, string[]> = {};
  let variablesByMessage: Record<number, string[]> = {};

  return {
    prefix,
    suffix,
    messageId(message) {
      let localeId = locales.indexOf(message.locale);
      if (localeId == -1) {
        localeId = locales.length;
        locales.push(message.locale);
        messagesByLocale[localeId] = [];
      }
      const messages = messagesByLocale[localeId]!;
      let messageId = messages.indexOf(message.message);
      if (messageId == -1) {
        messageId = messages.length;
        messages.push(message.message);
      }
      return (messageId << MESSAGE_SIZE) | localeId;
    },
    messageById(id) {
      const localeId = id & LOCALE_MASK;
      const messageId = id >> MESSAGE_SIZE;
      const locale = locales[localeId];
      const message = messagesByLocale[localeId]?.[messageId];
      if (locale == null || message == null) return null;
      return { locale, message };
    },
    variableId(variable, messageId) {
      const variables = (variablesByMessage[messageId] ??= []);
      let variableId = variables.indexOf(variable);
      if (variableId == -1) {
        variableId = variables.length;
        variables.push(variable);
      }
      return variableId;
    },
    variableById(id, messageId) {
      const variable = variablesByMessage?.[messageId]?.[id];
      if (variable == null) return null;
      return { variable };
    },
    writePrefix(type) {
      return prefix + writeType(type);
    },
    writeSuffix(id, type) {
      const length = LENGTH_BY_TYPE[type];
      return suffix + writeId(id, length);
    },
    readPrefix(input) {
      if (!input.startsWith(prefix)) return null;
      const type = readType(input.slice(prefix.length));
      if (type == null) return null;
      return { type: type.type, length: prefix.length + type.length };
    },
    readSuffix(input, type) {
      if (!input.startsWith(suffix)) return null;
      const length = LENGTH_BY_TYPE[type];
      const id = readId(input.slice(suffix.length), length);
      if (id == null) return null;
      return { id, length: suffix.length + length };
    },
    *messages() {
      for (let localeId = 0; localeId < locales.length; localeId++) {
        const locale = locales[localeId]!;
        const messages = messagesByLocale[localeId]!;
        for (let messageId = 0; messageId < messages.length; messageId++) {
          const message = messages[messageId]!;
          yield { locale, message };
        }
      }
    },
    *variables(messageId) {
      const variables = variablesByMessage[messageId];
      if (!variables) return;
      for (let variableId = 0; variableId < variables.length; variableId++) {
        const variable = variables[variableId]!;
        yield { variable };
      }
    },
    reset() {
      locales = [];
      messagesByLocale = {};
      variablesByMessage = {};
    },
  };
}

const PREFIX = "\u200c\u200d\u200b";
const SUFFIX = "\u200d\u200c\u200b";
const ID_CHARS = "\u200b\u200c\u200d";

const TAG_BY_TYPE = { message: 0, variable: 1 } as const;
const TYPE_BY_TAG = ["message", "variable"] as const;

const LOCALE_SIZE = 3; // 3^3 = 27
const MESSAGE_SIZE = 7; // 3^7 = 2187
const VARIABLE_SIZE = 3; // 3^3 = 27

const LOCALE_MASK = (1 << LOCALE_SIZE) - 1;

const LENGTH_BY_TYPE = {
  message: LOCALE_SIZE + MESSAGE_SIZE,
  variable: VARIABLE_SIZE,
} as const;

const defaultReadType: Required<MessageMapperOptions>["readType"] = function readType(input) {
  if (input.length < 1) return null;
  const index = ID_CHARS.indexOf(input[0]!);
  if (index == -1) return null;
  const type = TYPE_BY_TAG[index];
  if (type == null) return null;
  return { type, length: 1 };
};

const defaultWriteType: Required<MessageMapperOptions>["writeType"] = function writeType(type) {
  return ID_CHARS[TAG_BY_TYPE[type]]!;
};

const defaultReadId: Required<MessageMapperOptions>["readId"] = function readId(input, length) {
  if (input.length < length) return null;
  let id = 0;
  for (let i = 0; i < length; i++) {
    const index = ID_CHARS.indexOf(input[i]!);
    if (index == -1) return null;
    id = id * 3 + index;
  }
  return id;
};

const defaultWriteId: Required<MessageMapperOptions>["writeId"] = function writeId(id, length) {
  if (id >= 3 ** length) throw new Error(`ID is too large: ${id}`);
  let str = "";
  for (let i = 0; i < length; i++) {
    str = ID_CHARS[id % 3] + str;
    id = Math.floor(id / 3);
  }
  return str;
};

export const messageMapper = createMessageMapper();

Object.assign(globalThis, { messageMapper });
