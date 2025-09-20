<script setup lang="ts">
import { Collapsible, Dialog, Select } from "reka-ui/namespaced";
import { nextTick, watch } from "vue";
import { activated } from ".";
import ChangesetDialog from "./ChangesetDialog.vue";
import LanguageSelect from "./LanguageSelect.vue";

watch(
  activated,
  () => {
    const now = performance.now();
    nextTick(() => {
      const duration = performance.now() - now;
      console.log("ActionMenu updated in", duration.toFixed(2), "ms");
    });
  },
  { flush: "sync" },
);
</script>

<template>
  <Collapsible.Root
    v-model:open="activated"
    class="fixed inset-4 -m-1 flex items-center gap-3 self-end justify-self-start p-1 data-[state=open]:bg-white data-[state=open]:ring"
  >
    <Collapsible.Trigger class="border bg-blue-200 px-1.5 py-1 text-sm font-medium">
      Trigger
    </Collapsible.Trigger>

    <Collapsible.Content class="contents">
      <LanguageSelect default-value="en">
        <Select.Trigger class="text-sm">
          Source:
          <Select.Value class="font-bold" />
        </Select.Trigger>
      </LanguageSelect>

      <LanguageSelect default-value="de">
        <Select.Trigger class="text-sm">
          Target:
          <Select.Value class="font-bold" />
        </Select.Trigger>
      </LanguageSelect>

      <ChangesetDialog>
        <Dialog.Trigger class="border bg-gray-200 px-1.5 py-1 text-sm font-medium">
          0 changes
        </Dialog.Trigger>
      </ChangesetDialog>
    </Collapsible.Content>
  </Collapsible.Root>
</template>
