<script setup lang="ts">
import { useForwardPropsEmits, type SelectRootEmits, type SelectRootProps } from "reka-ui";
import { Select } from "reka-ui/namespaced";
import { computed } from "vue";

const props = defineProps<SelectRootProps>();
const emit = defineEmits<SelectRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);

const languages = computed(() =>
  ["en", "de", "ja"].map((code) => {
    const label = new Intl.DisplayNames(["en"], { type: "language" }).of(code);
    return { code, label };
  }),
);
</script>

<template>
  <Select.Root v-bind="forwarded">
    <slot />

    <Select.Portal>
      <Select.Content position-strategy="fixed" class="border bg-white">
        <Select.Viewport class="py-2">
          <Select.Item
            v-for="{ code, label } in languages"
            :key="code"
            :value="code"
            class="px-4 py-1 text-sm data-[state=checked]:font-bold"
          >
            <Select.ItemText>{{ label }}</Select.ItemText>
          </Select.Item>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>
