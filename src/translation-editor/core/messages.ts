export interface MessageMapper {
  prefix: string;
  suffix: string;
  messageId(message: string): number;
  messageById(id: number): string | null;
  variableId(variable: string, message: string): number;
  variableById(id: number, message: string): string | null;
  prefixWithType(type: Key["type"]): string;
  suffixWithId(id: number, type: Key["type"]): string;
  readPrefix(input: string): { type: Key["type"]; length: number } | null;
  readSuffix(input: string, type: Key["type"]): { id: number; length: number } | null;
}

export type Key = { type: "message"; key: string } | { type: "variable"; key: string };

export interface MessageMapperOptions {
  prefix?: string;
  suffix?: string;
  writeId?(type: Key["type"], id: number): string;
  readId?(type: Key["type"], input: string): { id: number; length: number } | null;
}

export function createMessageMapper(options: MessageMapperOptions = {}): MessageMapper {
  const {
    prefix = PREFIX,
    suffix = SUFFIX,
    writeId = defaultWriteId,
    readId = defaultReadId,
  } = options;

  const messages: string[] = [];
  const variablesByMessage: Record<string, string[]> = {};

  return {
    prefix,
    suffix,
    messageId(message) {
      let id = messages.indexOf(message);
      if (id == -1) {
        id = messages.length;
        messages.push(message);
      }
      return id;
    },
    messageById(id) {
      return messages[id] ?? null;
    },
    variableId(variable, message) {
      let variables = variablesByMessage[message];
      if (!variables) {
        variables = [];
        variablesByMessage[message] = variables;
      }
      let id = variables.indexOf(variable);
      if (id == -1) {
        id = variables.length;
        variables.push(variable);
      }
      return id;
    },
    variableById(id, message) {
      const variables = variablesByMessage[message];
      return variables?.[id] ?? null;
    },
    prefixWithType(type) {
      return prefix + ID_CHARS[TAG_BY_TYPE[type]];
    },
    suffixWithId(id, type) {
      return suffix + writeId(type, id);
    },
    readPrefix(input) {
      if (!input.startsWith(prefix) || input.length < prefix.length + 1) return null;
      const tag = input[prefix.length]!;
      const type = TYPE_BY_TAG[ID_CHARS.indexOf(tag)];
      if (type == null) return null;
      return { type, length: prefix.length + 1 };
    },
    readSuffix(input, type) {
      if (!input.startsWith(suffix)) return null;
      const id = readId(type, input.slice(suffix.length));
      if (id == null) return null;
      return { id: id.id, length: suffix.length + id.length };
    },
  };
}

const PREFIX = "\u200c\u200d";
const SUFFIX = "\u200d\u200c";
const ID_CHARS = "\u200b\u200c\u200d";
const TAG_BY_TYPE = { message: 0, variable: 1 } as const;
const TYPE_BY_TAG = ["message", "variable"] as const;
const LENGTH_BY_TYPE = [9, 3] as const; // 19683 messages, 27 variables

const defaultReadId: Required<MessageMapperOptions>["readId"] = function readId(type, input) {
  const length = LENGTH_BY_TYPE[TAG_BY_TYPE[type]];
  if (input.length < length) return null;
  let id = 0;
  for (let i = 0; i < length; i++) {
    const index = ID_CHARS.indexOf(input[i]!);
    if (index == -1) return null;
    id = id * 3 + index;
  }
  return { length, id };
};

const defaultWriteId: Required<MessageMapperOptions>["writeId"] = function writeId(type, id) {
  const length = LENGTH_BY_TYPE[TAG_BY_TYPE[type]];
  if (id >= 3 ** length) throw new Error(`ID is too large: ${id}`);
  let str = "";
  for (let i = 0; i < length; i++) {
    str = ID_CHARS[id % 3] + str;
    id = Math.floor(id / 3);
  }
  return str;
};

export const messageMapper = createMessageMapper();
