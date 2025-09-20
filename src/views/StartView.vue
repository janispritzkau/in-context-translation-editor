<script setup lang="ts">
import { isMessageAST, resolveValue, resolveWithKeyValue } from "@intlify/core-base";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const name = "John";
const changeLimit = 10;
const changeUrl = "https://example.com/change";

// const { selection, ranges } = useTextSelection();
// const { x, y } = usePointer();

// const floating = useTemplateRef("floating");

// const reference = computed(() =>
//   ranges.value.length > 0
//     ? ({
//         getBoundingClientRect: () => ranges.value[0].getBoundingClientRect(),
//         getClientRects: () => ranges.value[0].getClientRects(),
//       } satisfies VirtualElement)
//     : null,
// );

// const { floatingStyles } = useFloating(reference, floating, {
//   middleware: [autoPlacement(), inline(() => ({ x: x.value, y: y.value }))],
// });

const { messages, mergeLocaleMessage } = useI18n();
const key = "message.welcome";

const msg = computed({
  get: () => {
    const value =
      resolveWithKeyValue(messages.value.qtt ?? {}, key) ?? resolveValue(messages.value.en, key);
    return isMessageAST(value) ? value.loc?.source : String(value);
  },
  set: (v) => mergeLocaleMessage("qtt", { [key]: v }),
});
</script>

<template>
  <h1 ref="reference">{{ $t("message.welcome", [name]) }}</h1>

  <i18n-t keypath="info" tag="p" scope="global">
    <template v-slot:limit>
      <span>{{ changeLimit }}</span>
    </template>
    <template v-slot:action>
      <a :href="changeUrl">{{ $t("change") }}</a>
    </template>
  </i18n-t>

  <input type="text" :placeholder="$t('search')" />

  <!-- <div v-if="ranges.length" ref="floating" :style="floatingStyles">tooltip</div> -->

  <p>{{ $t("description") }}</p>

  <p>
    Laboriosam fuga quis dolores culpa et harum magni sit rerum. Nemo rerum expedita. Incidunt quia
    illum sed et voluptas. Tempora alias officia assumenda ut culpa. Corporis nam placeat. Non
    asperiores quia commodi doloribus ea.
  </p>

  <textarea class="max-w-full" rows="4" cols="80" v-model="msg" />

  <p>{{ $t("apples", 1) }}</p>
</template>
