<script setup lang="ts">
import { shallowRef } from "vue";
import type TranslationTool from "./components/TranslationTool/TranslationTool.vue";
import { load } from "./main";

const translationTool = shallowRef<typeof TranslationTool>();
</script>

<template>
  <div class="prose mx-auto my-6 px-6">
    <RouterView />

    <button @click="load().then((mod) => (translationTool = mod.TranslationTool))">Load</button>

    <component v-if="translationTool" :is="translationTool" />
  </div>
</template>

<i18n type="json">
{
  "test": "test"
}
</i18n>
