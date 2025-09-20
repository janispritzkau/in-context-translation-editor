<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { useChangesetContext } from "./ChangesetRoot.vue";

const props = withDefaults(defineProps<PrimitiveProps>(), {
  as: "button",
});

const context = useChangesetContext();

async function sendChanges() {
  location.href = `mailto:?body=${encodeURIComponent(context.changes.value.join("\n"))}`;
}
</script>

<template>
  <Primitive v-bind="props" @click="sendChanges">
    <slot />
  </Primitive>
</template>
