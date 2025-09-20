<script setup lang="ts">
import { type TextareaHTMLAttributes } from "vue";
import { useTextareaAutosize } from "./useTextareaAutosize";

export interface AutosizeTextareaProps
  extends /* @vue-ignore */ Omit<TextareaHTMLAttributes, "value"> {
  class?: TextareaHTMLAttributes["class"];
}

const props = defineProps<AutosizeTextareaProps>();
const input = defineModel<string>({ default: "" });

const { textarea } = useTextareaAutosize({ input });
</script>

<template>
  <textarea ref="textarea" v-model="input" :class="['resize-none', props.class]" />
</template>
