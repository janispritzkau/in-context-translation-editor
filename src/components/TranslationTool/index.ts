import { ref } from "vue";

export const activated = ref(false);

export { createMessageCompiler, messageCompiler } from "./messages";
export type { CreatePatchOptions } from "./patch";
export { createJsonPatch } from "./formatJson";
export { createYamlPatch } from "./formatYaml";

export { default } from "./TranslationTool.vue";
