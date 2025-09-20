<script setup lang="ts">
import { Popover, Select } from "reka-ui/namespaced";
import LanguageSelect from "./LanguageSelect.vue";
import AutosizeTextarea from "./AutosizeTextarea.vue";
</script>

<template>
  <Popover.Root>
    <slot />

    <Popover.Portal>
      <Popover.Content
        position-strategy="fixed"
        class="border bg-white p-6"
        :collision-padding="8"
        :side-offset="4"
      >
        <p class="flex items-end">
          <span class="bg-gray-200 px-[.2em] font-mono text-sm font-bold">test.key</span>

          <button class="ms-auto border bg-red-200 px-1.5 py-1 text-xs font-medium">Revert</button>
        </p>

        <div class="mt-4 grid gap-2">
          <AutosizeTextarea
            placeholder="test"
            class="block w-md border border-gray-400 px-2 py-1.5"
          />

          <div class="text-sm">
            <LanguageSelect default-value="en" class="me-2">
              <Select.Trigger>
                Target:
                <Select.Value class="font-bold" />
              </Select.Trigger>
            </LanguageSelect>
          </div>
        </div>

        <div class="mt-4 grid gap-2">
          <AutosizeTextarea
            model-value="testing 1234"
            readonly
            class="block w-md border border-gray-400 px-2 py-1.5"
          />

          <div class="text-sm">
            <LanguageSelect default-value="de" class="me-2">
              <Select.Trigger>
                Source:
                <Select.Value class="font-bold" />
              </Select.Trigger>
            </LanguageSelect>
          </div>
        </div>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</template>
