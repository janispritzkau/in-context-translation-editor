<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { AlertDialog } from "reka-ui/namespaced";
import { useChangesetContext } from "./ChangesetRoot.vue";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<PrimitiveProps>(), {
  as: "button",
});

const context = useChangesetContext();

async function resetChanges() {
  context.changes.value = [];
  await new Promise((resolve) => setTimeout(resolve, 150));
}
</script>

<template>
  <AlertDialog.Root v-slot="{ close }">
    <AlertDialog.Trigger as-child v-bind="$attrs">
      <Primitive v-bind="props">
        <slot />
      </Primitive>
    </AlertDialog.Trigger>

    <AlertDialog.Portal>
      <AlertDialog.Overlay class="fixed inset-0 bg-black/30" />

      <AlertDialog.Content class="fixed inset-6 place-self-center border bg-white p-6">
        <AlertDialog.Title class="text-lg font-bold">Reset Changes</AlertDialog.Title>

        <AlertDialog.Description class="mt-1">
          Are you sure you want to reset all changes?
        </AlertDialog.Description>

        <div class="mt-6 flex gap-4">
          <AlertDialog.Cancel class="border px-3 py-2 text-sm font-medium">
            Cancel
          </AlertDialog.Cancel>

          <button
            @click="resetChanges().then(close)"
            class="ms-auto border bg-red-300 px-3 py-2 text-sm font-medium"
          >
            Reset All
          </button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</template>
