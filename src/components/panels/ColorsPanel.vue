<template>
  <TickSettingsPanel :showFooter="false" :panelOptions="panelOptions" class="labels-panel" @close="emit('close')">
    <template #title>{{ $translate(LanguagePath.App_Colors) }}</template>
    <template #actions></template>
    <template #footer></template>

    <div class="content">
      <TickColorsSwatch @select="selectColor" :selected="selected" />
    </div>
  </TickSettingsPanel>
</template>

<script setup lang="ts">
import { TickPanelOptions } from '@/components/atoms/TickPanel.vue';
import { focus } from '@/directives';
import { getColorName, getColorOptionsForUI } from '@/helpers/colorsHelper';
import { ColorsEnum, LanguagePath } from '@/TickApi';
import { computed } from 'vue';

import TickSettingsPanel from '@/components/panels/TickSettingsPanel.vue';
import TickColorsSwatch from '../atoms/TickColorsSwatch.vue';

defineOptions({
  directives: { focus },
});

const emit = defineEmits<{
  (e: 'select', color?: ColorsEnum): void;
  (e: 'close'): void;
}>();

const props = defineProps<{
  panelOptions: TickPanelOptions;
  selected: ColorsEnum;
}>();

const colorOptions = computed(() => getColorOptionsForUI());

function colorIsSelected(c: ColorsEnum) {
  return props.selected === c;
}

function removeColor() {
  selectColor(undefined);
}

function getColorNameWrapped(c: ColorsEnum) {
  return getColorName(c);
}

function selectColor(color?: ColorsEnum) {
  emit('select', color);
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.labels-list {
  width: 192px;
}

.preview-panel {
  display: grid;
  align-content: center;
  justify-content: center;
  height: 75px;
  background-color: var(--c-base-300);
  padding-left: 10px;

  .previewLabel {
    width: 240px;
    display: block;
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.colors-wrapper {
  display: flex;
  gap: 7px;
  max-width: 300px;
  flex-wrap: wrap;

  .color-selector {
    @include neon-bg;
    height: 32px;
    width: 48px;
    border-radius: 4px;

    &.selected {
      outline-width: 2px;
      outline-style: solid;
      outline-color: var(--c-contrast);
    }
  }
}
</style>
