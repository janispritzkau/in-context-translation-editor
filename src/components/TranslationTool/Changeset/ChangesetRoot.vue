<script lang="ts">
import { createInjectionState } from "@vueuse/core";
import { reactive, ref, toRef, type Ref } from "vue";

export interface ChangesetRootContext {
  changes: Readonly<Ref<string[]>>;
}

const [provideChangesetContext, injectChangesetContext] = createInjectionState(() => {
  const changes = ref<string[]>([]);

  return {
    changes,
    isEmpty: toRef(() => changes.value.length == 0),
  };
});

export function useChangesetContext() {
  const context = injectChangesetContext();
  if (context) return context;
  throw new Error("useChangesetContext must be used within ChangesetRoot.");
}
</script>

<script setup lang="ts">
const context = provideChangesetContext();

const slotProps = reactive({
  isEmpty: context.isEmpty,
});
</script>

<template>
  <slot v-bind="slotProps" />
</template>
