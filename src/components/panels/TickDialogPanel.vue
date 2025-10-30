<template>
  <TickPanel @close="close" ref="panel" :showAsModal="true" class="dialog-panel" :style="style" :type="type" :transparentBackdrop="transparentBackdrop" :allowAsSubDialog="allowAsSubDialog">
    <div class="header" v-if="header">
      <div class="title">
        <slot name="title" />
        <BusyIndicator :loading="loading" />
      </div>

      <div class="actions">
        <slot name="actions" />
        <button v-if="!noClose" class="close-button" @click="emit('close')">
          <TickIcon name="close" />
        </button>
      </div>
    </div>

    <div class="content">
      <slot />
    </div>

    <div class="footer" v-if="hasFooterSlot && showFooter">
      <slot name="footer" />
    </div>
  </TickPanel>
</template>

<script setup lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import TickPanel, { PanelStyle, TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import keyboard from "@/helpers/keyboard";
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue";
import BusyIndicator from "../atoms/BusyIndicator.vue";

const props = defineProps<{
  panelOptions?: TickPanelOptions;
  header?: boolean;
  loading?: boolean;
  showFooter?: boolean;
  noClose?: boolean;
  style?: Record<string, any>;
  type?: PanelStyle;
  transparentBackdrop?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Default values (same as decorator defaults)
const header = computed(() => props.header ?? true);
const loading = computed(() => props.loading ?? false);
const showFooter = computed(() => props.showFooter ?? true);
const noClose = computed(() => props.noClose ?? false);
const transparentBackdrop = computed(() => props.transparentBackdrop ?? false);

// Local refs
const panel = ref<InstanceType<typeof TickPanel> | null>(null);
const keyboardId = ref<number>();

const slots = useSlots();

// === Computed ===
const allowAsSubDialog = computed(() => props.panelOptions?.allowAsSubDialog ?? false);
const hasFooterSlot = computed(() => !!slots.footer);

// === Methods ===
function close() {
  if (noClose.value) return;
  emit("close");
}

// === Lifecycle ===
onMounted(() => {
  keyboardId.value = keyboard.on(
    "Escape",
    () => {
      close();
    },
    { ignoreInputFieldEvents: false }
  );
});

onBeforeUnmount(() => {
  if (keyboardId.value !== undefined) keyboard.off(keyboardId.value);
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.dialog-panel {
  width: min-content;
  padding: 16px;
  min-width: 230px;
}

.footer {
  border-top: solid 1px var(--c-base-200);
  margin-top: 15px;
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  gap: 5px;
  align-items: center;
}

.header {
  display: flex;
  padding-bottom: 12px;

  .title {
    flex-grow: 1;
    @include font-outfit;
    text-transform: uppercase;
    font-size: $text-size-regular;
    font-weight: 600;
    line-height: 20px;
  }

  button {
    flex-shrink: 0;
    opacity: 0.6;
  }

  .actions {
    display: flex;
    gap: 10px;
  }
}
</style>
