<script setup lang="ts">
import { diffWords } from "diff";
import { VisuallyHidden } from "reka-ui";
import { Dialog, Popover } from "reka-ui/namespaced";
import Changeset from "./Changeset";
import EditorPopover from "./EditorPopover.vue";

const changes = diffWords("Red is the color of apples.", "Green is the color of grass, right?", {
  intlSegmenter: new Intl.Segmenter("en", { granularity: "word" }),
});
</script>

<template>
  <Dialog.Root>
    <slot />

    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 bg-black/30" />

      <Changeset.Root v-slot="{ isEmpty }">
        <Dialog.Content
          class="fixed inset-4 max-w-full place-self-center border bg-white p-6"
          :class="isEmpty ? 'w-xs text-center' : 'w-2xl'"
        >
          <template v-if="isEmpty">
            <VisuallyHidden as-child>
              <Dialog.Title>Translation Changes</Dialog.Title>
            </VisuallyHidden>

            <Dialog.Description>No changes were made.</Dialog.Description>

            <Changeset.Import class="mt-4 border px-3 py-2 text-sm font-medium">
              Import From Diff
            </Changeset.Import>
          </template>

          <template v-else>
            <Dialog.Title class="text-lg font-bold">Your Translations</Dialog.Title>

            <Dialog.Description class="mt-1">Review your changes below.</Dialog.Description>

            <!-- <Changeset.Changes /> -->
            <h3 class="mt-4 font-bold">English (en)</h3>

            <dl>
              <div class="mt-2">
                <!-- <div class="float-end">
                <button class="-my-0.5 me-1 border px-1.5 py-0.5 text-sm font-medium">Edit</button>
                <button class="-my-0.5 border bg-red-200 px-1.5 py-0.5 text-sm font-medium">
                  Revert
                </button>
              </div> -->

                <dt class="float-start me-2">
                  <span class="bg-gray-200 px-[.1em] font-mono text-sm font-bold">test.key</span>
                </dt>

                <dd class="inline">
                  <span
                    v-for="(change, index) in changes"
                    :key="index"
                    :class="[change.added && 'bg-green-200', change.removed && 'bg-red-200']"
                  >
                    {{ change.value }}
                  </span>
                </dd>
              </div>
              <dt class="mt-2">
                <!-- <div class="float-end">
                <button class="-my-0.5 me-1 border px-1.5 py-0.5 text-sm font-medium">Edit</button>
                <button class="-my-0.5 border bg-red-200 px-1.5 py-0.5 text-sm font-medium">
                  Revert
                </button>
              </div> -->

                <span class="bg-gray-200 px-[.1em] font-mono text-sm font-bold">
                  message.welcome
                </span>
              </dt>
              <dd>
                <span
                  v-for="(change, index) in changes.filter((c) => !c.added)"
                  :key="index"
                  :class="change.removed && 'bg-red-200'"
                  class="text-red-900"
                >
                  {{ change.value }}
                </span>
                <br />
                <span
                  v-for="(change, index) in changes.filter((c) => !c.removed)"
                  :key="index"
                  :class="change.added && 'bg-green-200'"
                  class="text-green-900"
                >
                  {{ change.value }}
                </span>
              </dd>
              <dt class="mt-2">
                <!-- <div class="float-end">
                <button class="-my-0.5 me-1 border px-1.5 py-0.5 text-sm font-medium">Edit</button>
                <button class="-my-0.5 border bg-red-200 px-1.5 py-0.5 text-sm font-medium">
                  Revert
                </button>
              </div> -->

                <span class="bg-gray-200 px-[.1em] font-mono text-sm font-bold">
                  message.welcome
                </span>
              </dt>
              <dd>
                <span
                  v-for="(change, index) in changes.filter((c) => !c.added)"
                  :key="index"
                  :class="change.removed && 'bg-red-200'"
                  class="text-red-900"
                >
                  {{ change.value }}
                </span>
                <br />
                <span
                  v-for="(change, index) in changes.filter((c) => !c.removed)"
                  :key="index"
                  :class="change.added && 'bg-green-200'"
                  class="text-green-900"
                >
                  {{ change.value }}
                </span>
              </dd>
            </dl>

            <h3 class="mt-4 font-bold">German (de)</h3>

            <dl>
              <div v-for="n in 2" :key="n" class="mt-2">
                <EditorPopover>
                  <!-- <div class="float-end">
                  <button class="-my-0.5 border bg-red-200 px-1.5 py-0.5 text-sm font-medium">
                    Revert
                  </button>
                </div> -->

                  <dt class="float-start me-2 inline">
                    <Popover.Trigger as="button" class="inline cursor-pointer">
                      <span class="bg-gray-200 px-[.1em] font-mono text-sm font-bold">
                        test.key
                      </span>
                    </Popover.Trigger>
                  </dt>
                </EditorPopover>

                <dd class="inline">
                  <span
                    v-for="(change, index) in changes"
                    :key="index"
                    :class="[change.added && 'bg-green-200', change.removed && 'bg-red-200']"
                  >
                    {{ change.value }}
                  </span>
                </dd>
              </div>
            </dl>

            <div class="mt-6 flex gap-4">
              <Changeset.Reset class="border px-3 py-2 text-sm font-medium">
                Reset All
              </Changeset.Reset>
              <Changeset.CopyDiff class="ms-auto border px-3 py-2 text-sm font-medium">
                Copy Diff
              </Changeset.CopyDiff>
              <Changeset.SendMail class="border bg-blue-200 px-3 py-2 text-sm font-medium">
                Send Mail
              </Changeset.SendMail>
            </div>
          </template>
        </Dialog.Content>
      </Changeset.Root>
    </Dialog.Portal>
  </Dialog.Root>
</template>
