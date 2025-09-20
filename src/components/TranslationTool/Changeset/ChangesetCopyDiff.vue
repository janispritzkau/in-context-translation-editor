<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { useChangesetContext } from "./ChangesetRoot.vue";

const props = withDefaults(defineProps<PrimitiveProps>(), {
  as: "button",
});

const context = useChangesetContext();

async function copyChanges() {
  console.log("copy", context.changes.value);
  alert("Copied to clipboard!");
}
</script>

<template>
  <Primitive v-bind="props" @click="copyChanges">
    <slot />
  </Primitive>
</template>
