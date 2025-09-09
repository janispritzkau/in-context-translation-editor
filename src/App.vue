<script setup lang="ts">
import { onMounted } from "vue";
import { traverseMessages } from "./translation-editor/core/dom";

onMounted(() => {
  console.log([...traverseMessages()]);
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">{{ $t("message.youDidIt") }}</h1>

    <i18n-t scope="global" keypath="message.seeDocs" tag="p" class="mt-4">
      Visit
      <template #link>
        <a href="https://vuejs.org/" target="_blank" rel="noopener" class="underline">vuejs.org</a>
      </template>
      to read the documentation
    </i18n-t>

    <i18n-t scope="global" keypath="term" for="tos" tag="p" class="mt-4">
      <a href="/tos" target="_blank" class="underline">{{ $t("tos") }}</a>
    </i18n-t>

    <ul class="mt-4 list-disc pl-6">
      <li>0 {{ $t("car", { n: 0 }) }}</li>
      <li>1 {{ $t("car", { n: 1 }) }}</li>
      <li>2 {{ $t("car", { n: 2 }) }}</li>
      <li>{{ $t("apple", { count: 0 }) }}</li>
      <li>{{ $t("apple", { count: 1 }) }}</li>
      <li>{{ $t("apple", { count: 2 }) }}</li>
      <li>{{ $t("banana", 10) }}</li>
    </ul>

    <i18n-t scope="global" keypath="info" tag="p" class="mt-4">
      <template v-slot:limit>15</template>
      <template v-slot:action>
        <a href="/change" class="underline">{{ $t("change") }}</a>
      </template>
    </i18n-t>
  </div>
</template>

<style scoped></style>
