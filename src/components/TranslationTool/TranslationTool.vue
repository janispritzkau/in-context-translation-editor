<script setup lang="ts">
import { resolveValue } from "@intlify/core-base";
import { useIntervalFn, watchDeep } from "@vueuse/core";
import { Popover } from "reka-ui/namespaced";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { activated } from ".";
import ActionMenu from "./ActionMenu.vue";
import AutosizeTextarea from "./AutosizeTextarea.vue";
import EditorPopover from "./EditorPopover.vue";
import { parseJson } from "./formatJson";
import { parseYaml } from "./formatYaml";
import { type MessageRange, type Messages, traverseMessages } from "./messages";

const messages = ref<MessageRange[]>([]);

function updateMessages() {
  messages.value = [...traverseMessages()];
}

const { resume, pause } = useIntervalFn(updateMessages, 1000);

watchEffect(() => {
  if (activated.value) {
    // resume();
    updateMessages();
  } else {
    pause();
    messages.value = [];
  }
});

const boundingRects = computed(() => {
  return messages.value.map(({ range }) => range.getBoundingClientRect());
});

function* mergeRects(rects: Iterable<DOMRect>) {
  let lastRect: DOMRect | null = null;

  for (const rect of rects) {
    if (rect.width === 0 || rect.height === 0) continue;

    if (!lastRect) {
      lastRect = rect;
      continue;
    }

    const horizontal = rect.top == lastRect.top && rect.bottom == lastRect.bottom;
    const vertical = rect.left == lastRect.left && rect.right == lastRect.right;

    if (horizontal && (rect.left <= lastRect.left || rect.right >= lastRect.right)) {
      lastRect = new DOMRect(
        Math.min(lastRect.left, rect.left),
        lastRect.top,
        Math.max(lastRect.right, rect.right) - Math.min(lastRect.left, rect.left),
        lastRect.height,
      );
    } else if (vertical && (rect.top <= lastRect.top || rect.bottom >= lastRect.bottom)) {
      lastRect = new DOMRect(
        lastRect.left,
        Math.min(lastRect.top, rect.top),
        lastRect.width,
        Math.max(lastRect.bottom, rect.bottom) - Math.min(lastRect.top, rect.top),
      );
    } else {
      yield lastRect;
      lastRect = rect;
    }
  }

  if (lastRect) yield lastRect;
}

const clientRects = computed(() => {
  return messages.value.map(({ range }) => {
    return Array.from(mergeRects(range.getClientRects()));
    // const rects: DOMRect[] = [];
    // let lastRect: DOMRect | null = null;
    // for (const rect of range.getClientRects()) {
    //   if (rect.width === 0 || rect.height === 0) continue;

    //   if (lastRect) {
    //     const horizontal = rect.top == lastRect.top && rect.bottom == lastRect.bottom;
    //     const vertical = rect.left == lastRect.left && rect.right == lastRect.right;
    //     if (horizontal && (rect.left <= lastRect.left || rect.right >= lastRect.right)) {
    //       lastRect = new DOMRect(
    //         Math.min(lastRect.left, rect.left),
    //         lastRect.top,
    //         Math.max(lastRect.right, rect.right) - Math.min(lastRect.left, rect.left),
    //         lastRect.height,
    //       );
    //     } else if (vertical && (rect.top <= lastRect.top || rect.bottom >= lastRect.bottom)) {
    //       lastRect = new DOMRect(
    //         lastRect.left,
    //         Math.min(lastRect.top, rect.top),
    //         lastRect.width,
    //         Math.max(lastRect.bottom, rect.bottom) - Math.min(lastRect.top, rect.top),
    //       );
    //     } else lastRect = rect;
    //   } else lastRect = rect;

    //   if (rect == lastRect) rects.push(rect);
    //   else rects[rects.length - 1] = lastRect;
    // }
    // return rects;
  });
});

const { locale, setLocaleMessage, fallbackLocale } = useI18n({ useScope: "global" });

const originalMessages = import.meta.glob("./*", {
  eager: true,
  query: "?raw",
  base: "../../locales",
  import: "default",
});

const localeMessages: Record<string, Messages> = {};

for (const fileName in originalMessages) {
  const locale = fileName.slice(fileName.indexOf("/") + 1, fileName.lastIndexOf("."));
  let parsed: unknown;
  if (fileName.endsWith(".json")) {
    parsed = parseJson(originalMessages[fileName] as string);
  } else {
    parsed = parseYaml(originalMessages[fileName] as string);
  }
  localeMessages[locale] = parsed as Messages;
}

const editedMessages = ref<Record<string, string>>({});

watchDeep(editedMessages, (newVal) => {
  setLocaleMessage("qtt", newVal);
});

const previousLocale = locale.value;
fallbackLocale.value = [previousLocale, "en"];
locale.value = "qtt";
</script>

<template>
  <ActionMenu />

  {{ resolveValue(localeMessages["en"], "info") }}

  <EditorPopover>
    <Popover.Trigger>Open</Popover.Trigger>
  </EditorPopover>

  <div
    v-for="({ key, values }, i) in messages"
    :key="i"
    :style="{
      width: `${boundingRects[i].width}px`,
      height: `${boundingRects[i].height}px`,
      top: `${boundingRects[i].top}px`,
      left: `${boundingRects[i].left}px`,
    }"
    class="pointer-events-none absolute z-50"
  >
    <Popover.Root>
      <Popover.Trigger
        v-for="(rect, j) in clientRects[i]"
        :key="j"
        :style="{
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          top: `${rect.top - boundingRects[i].top}px`,
          left: `${rect.left - boundingRects[i].left}px`,
        }"
        class="pointer-events-auto absolute bg-blue-500/10 outline-1 -outline-offset-1 outline-blue-700 outline-dashed"
      />

      <Popover.Portal>
        <Popover.Content side="bottom" class="z-50 border bg-white p-6 shadow-lg">
          <AutosizeTextarea
            :model-value="
              editedMessages[key] ?? (resolveValue(localeMessages['de'], key) as string)
            "
            @update:model-value="(val) => (editedMessages[key] = val)"
            :placeholder="key"
            class="block w-64 border border-gray-400 px-2 py-1"
          />
          <AutosizeTextarea
            :model-value="resolveValue(localeMessages['en'], key) as string"
            :placeholder="key"
            readonly
            class="block h-3 w-64 border border-gray-400 px-2 py-1"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </div>
</template>
