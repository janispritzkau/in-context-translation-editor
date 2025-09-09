import { messageMapper, type MessageMapper } from "./messages";

export interface MessageRange {
  range: Range;
  message: string;
  variables: MessageVariableRange[];
}

export interface MessageVariableRange {
  range: Range;
  variable: string;
  messages: MessageRange[];
}

export function* traverseMessages(
  mapper: MessageMapper = messageMapper,
  root: Node = document.body,
): IterableIterator<MessageRange> {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);

  const stack: {
    range: Range;
    valueRange?: Range;
    valueMessages: MessageRange[];
    variables: (Omit<MessageVariableRange, "variable"> & { id: number })[];
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
      const prefixIndex = text.indexOf(mapper.prefix, offset);
      const suffixIndex = text.indexOf(mapper.suffix, offset);
      if (prefixIndex == -1 && suffixIndex == -1) break;

      const isPrefixFirst = prefixIndex != -1 && (prefixIndex < suffixIndex || suffixIndex == -1);
      const isSuffixFirst = suffixIndex != -1 && (suffixIndex < prefixIndex || prefixIndex == -1);

      if (isPrefixFirst) {
        offset = prefixIndex + mapper.prefix.length;

        const prefix = mapper.readPrefix(text.slice(prefixIndex));
        if (!prefix) continue;

        offset = prefixIndex + prefix.length;

        const range = document.createRange();
        if (isTextNode) range.setStart(node, prefixIndex);
        else range.selectNode(node);

        if (prefix.type == "message") {
          stack.push({ range: range, variables: [], valueMessages: [] });
        } else if (prefix.type == "variable") {
          const message = stack[stack.length - 1];
          if (message) message.valueRange = range;
        }
      }

      if (isSuffixFirst) {
        offset = suffixIndex + mapper.suffix.length;

        const last = stack.pop();
        if (!last) continue;

        const type = last.valueRange ? "variable" : "message";
        const suffix = mapper.readSuffix(text.slice(suffixIndex), type);
        if (!suffix) continue;

        offset = suffixIndex + suffix.length;

        const range = last.valueRange ?? last.range;
        if (isTextNode) range.setEnd(node, suffixIndex + mapper.suffix.length);

        if (last.valueRange) {
          last.variables.push({ range, id: suffix.id, messages: last.valueMessages });
          delete last.valueRange;
          stack.push(last);
        } else {
          const message = mapper.messageById(suffix.id);
          if (!message) continue;
          const messageRange: MessageRange = {
            range,
            message,
            variables: last.variables
              .map((v) => {
                const variable = mapper.variableById(v.id, message);
                if (!variable) return null;
                return { range: v.range, variable, messages: v.messages };
              })
              .filter((v) => v != null),
          };
          const parent = stack[stack.length - 1];
          if (parent) parent.valueMessages.push(messageRange);
          else yield messageRange;
        }
      }
    }
  }
}
