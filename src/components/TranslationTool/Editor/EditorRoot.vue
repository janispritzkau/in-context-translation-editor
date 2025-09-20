<script lang="ts">
export interface EditorRootContext {
  reset: () => void;
}

export const [provideEditorContext, injectEditorContext] = createInjectionState(() => {
  return {
    reset: () => {},
  } as EditorRootContext;
});
</script>

<script setup lang="ts">
import { createInjectionState } from "@vueuse/core";
import { reactive } from "vue";

defineSlots<{
  default: (props: { reset: () => void }) => unknown;
}>();

const context = provideEditorContext();

const slotProps = reactive({
  reset: context.reset,
});
</script>

<template>
  <slot v-bind="slotProps" />
</template>
