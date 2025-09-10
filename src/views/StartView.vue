<script setup lang="ts">
import type { MessageCompiler } from "@intlify/core-base";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { messageCompiler } from "~/translation-editor/vue-i18n";

const limit = ref(30);
const action = ref<"change" | "refund">("change");

const { t } = useI18n({
  messageCompiler: messageCompiler as MessageCompiler,
  messages: {
    jp: {
      change: "変更した",
      refund: "払い戻した",
    },
  },
});
</script>

<template>
  <h1 class="text-2xl font-bold">{{ t("message.youDidIt") }}</h1>

  <i18n-t keypath="message.seeDocs" tag="p" class="mt-4">
    Visit
    <template #link>
      <a href="https://vuejs.org/" target="_blank" rel="noopener" class="underline">vuejs.org</a>
    </template>
    to read the documentation
  </i18n-t>

  <i18n-t keypath="term" for="tos" tag="p" class="mt-4">
    <a href="/tos" target="_blank" class="underline">{{ t("tos") }}</a>
  </i18n-t>

  <ul class="mt-4 list-disc pl-6">
    <li>0 {{ t("car", { n: 0 }) }}</li>
    <li>1 {{ t("car", { n: 1 }) }}</li>
    <li>2 {{ t("car", { n: 2 }) }}</li>
    <li>{{ t("apple", { count: 0 }) }}</li>
    <li>{{ t("apple", { count: 1 }) }}</li>
    <li>{{ t("apple", { count: 2 }) }}</li>
    <li>{{ t("banana", 10) }}</li>
  </ul>

  <label for="limit" class="mt-4 block">
    Limit:
    <input id="limit" type="number" class="ml-2 rounded border px-2 py-1" v-model="limit" />
  </label>

  <fieldset class="mt-4 flex gap-4">
    <legend class="mb-2">Select Action</legend>

    <label>
      <input type="radio" value="change" v-model="action" />
      change
    </label>

    <label>
      <input type="radio" value="refund" v-model="action" />
      refund
    </label>
  </fieldset>

  <i18n-t keypath="info" tag="p" class="mt-4">
    <template v-slot:limit>{{ limit }}</template>
    <template v-slot:action>
      <a v-if="action == 'change'" href="/change" class="underline">{{ t("change") }}</a>
      <a v-if="action == 'refund'" href="/refund" class="underline">{{ t("refund") }}</a>
    </template>
  </i18n-t>

  <i18n-t keypath="info" tag="p" class="mt-4">
    <template v-slot:limit>{{ limit }}</template>
    <template v-slot:action>
      <a v-if="action == 'change'" href="/change" class="underline">{{ $t("change") }}</a>
      <a v-if="action == 'refund'" href="/refund" class="underline">{{ $t("refund") }}</a>
    </template>
  </i18n-t>
</template>
