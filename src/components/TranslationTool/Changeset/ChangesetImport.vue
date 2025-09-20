<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { Dialog } from "reka-ui/namespaced";
import { useChangesetContext } from "./ChangesetRoot.vue";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<PrimitiveProps>(), {
  as: "button",
});

const context = useChangesetContext();

async function importChanges() {
  context.changes.value = ["test"];
}
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child v-bind="$attrs">
      <Primitive v-bind="props">
        <slot />
      </Primitive>
    </Dialog.Trigger>

    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 bg-black/30" />

      <Dialog.Content class="fixed inset-4 w-2xl place-self-center border bg-white p-6">
        <Dialog.Title class="text-lg font-bold">Import Translations</Dialog.Title>

        <Dialog.Description class="mt-1">
          Paste the diff text below to import translation changes.
        </Dialog.Description>

        <textarea
          rows="8"
          class="mt-4 block w-full resize-none border px-2 py-1.5 font-mono text-sm"
        />

        <button
          @click="importChanges().then(close)"
          class="mt-6 border px-3 py-2 text-sm font-medium"
        >
          Import Changes
        </button>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
