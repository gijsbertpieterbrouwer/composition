<!-- src/components/panels/TickSettingsPanel.vue -->
<template>
  <TickPanel ref="panel" :position="position" :show-as-modal="showAsModal" :allow-as-sub-dialog="allowAsSubDialog" class="settings-panel" :no-padding="noPadding" @close="close">
    <div v-if="header" class="header">
      <div class="title">
        <slot name="title" />
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>

    <div class="content">
      <slot />
    </div>

    <div v-if="hasFooterSlot && showFooter" class="footer">
      <slot name="footer" />
    </div>
  </TickPanel>
</template>

<script setup lang="ts">
import TickPanel, { PanelDefaultPosition, Position, TickPanelOptions } from '@/components/atoms/TickPanel.vue';
import { computed, nextTick, onMounted, ref, useSlots } from 'vue';

// === Props ===
interface Props {
  panelOptions?: TickPanelOptions;
  header?: boolean;
  showFooter?: boolean;
  noPadding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  header: true,
  showFooter: true,
  noPadding: false,
});

// === Emits ===
const emit = defineEmits<{
  close: [byKeyboard: boolean];
}>();

// === Slots ===
const slots = useSlots();
const hasFooterSlot = computed(() => !!slots.footer);

// === Refs ===
const panel = ref<InstanceType<typeof TickPanel> | null>(null);
const position = ref<Position | null>(null);

// === Computed ===
const showAsModal = computed(() => props.panelOptions?.showAsModal ?? false);
const allowAsSubDialog = computed(() => props.panelOptions?.allowAsSubDialog ?? false);

// === Close ===
const close = (byKeyboard: boolean) => {
  emit('close', byKeyboard);
};

// === Positioning Logic ===
const calculatePositionFromXYCoordinate = () => {
  const x = props.panelOptions?.x;
  const y = props.panelOptions?.y;
  if (x === undefined || y === undefined) return;

  let left = x;
  let top: number | undefined = y;
  let bottom: number | null = null;

  const panelEl = panel.value?.$el as HTMLElement | undefined;
  const panelRect = panelEl?.getBoundingClientRect() ?? { height: 0 };
  const spacingFromWindowSide = 10;
  const fromSpacing = 1;

  if (panelRect.height + y >= window.innerHeight) {
    if (y - panelRect.height > spacingFromWindowSide) {
      top = undefined;
      bottom = fromSpacing;
    } else {
      top = spacingFromWindowSide;
    }
  }

  position.value = {
    left: `${left}px`,
    top: top !== undefined ? `${top}px` : undefined,
    bottom: bottom !== null ? `${bottom}px` : undefined,
  };
};

const calculatePositionFromRect = () => {
  const fromRect = props.panelOptions?.from;
  if (!fromRect) return;

  const fromSpacing = props.panelOptions?.offset_Y ?? 1;
  const spacingFromWindowSide = 10;
  const panelEl = panel.value?.$el as HTMLElement | undefined;
  const panelRect = panelEl?.getBoundingClientRect() ?? { width: 0, height: 0 };

  const defaultPosition = props.panelOptions?.defaultPosition ?? PanelDefaultPosition.left;
  const defaultLeft =
    defaultPosition === PanelDefaultPosition.left
      ? Math.floor(fromRect.left)
      : Math.floor(fromRect.right - panelRect.width);

  const pos: { left: number; top?: number; bottom?: number } = {
    left: defaultLeft,
    top: Math.floor(fromRect.bottom + fromSpacing),
  };

  // Vertical flip
  if (panelRect.height + (pos.top ?? 0) >= window.innerHeight) {
    if ((pos.top ?? 0) - panelRect.height > spacingFromWindowSide) {
      pos.top = undefined;
      pos.bottom = window.innerHeight - (fromRect.bottom - fromSpacing - fromRect.height);
    } else {
      pos.top = spacingFromWindowSide;
    }
  }

  // Horizontal clamp
  if (panelRect.width + pos.left >= window.innerWidth - spacingFromWindowSide) {
    pos.left = Math.min(
      fromRect.right - panelRect.width,
      window.innerWidth - panelRect.width - spacingFromWindowSide
    );
    if (pos.left < 0) pos.left = 0;
  }

  position.value = {
    left: `${pos.left}px`,
    top: pos.top !== undefined ? `${pos.top}px` : undefined,
    bottom: pos.bottom !== undefined ? `${pos.bottom}px` : undefined,
  };
};

// === Lifecycle ===
onMounted(async () => {
  await nextTick();
  if (!showAsModal.value && props.panelOptions) {
    if (props.panelOptions.x != null && props.panelOptions.y != null) {
      calculatePositionFromXYCoordinate();
    } else if (props.panelOptions.from) {
      calculatePositionFromRect();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.footer {
  border-top: solid 1px var(--c-base-200);
  margin-top: 15px;
  padding-top: 20px;
}

.settings-panel {
  width: min-content;
  min-width: 230px;
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
    align-self: center;
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