<template>
  <div class="content">

    <div class="colors-wrapper" v-for="(colorRow, rowIndex) in this.colorOptions" :key="rowIndex">

      <template v-for="(color, index) in this.colorOptions[rowIndex]" :key="index">
        <button @click="selectColor(color)" class="color-selector" :class="[this.getColorName(color), { selected: this.colorIsSelected(color) }]" />
      </template>
    </div>

    <TickButton @click="removeColor" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">{{ $translate(LanguagePath.App_ColorsSwatch_RemoveColor) }}</TickButton>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";


import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";

import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import { focus } from "@/directives";
import { getColorName, getColorOptionsForUI } from "@/helpers/colorsHelper";
import { ColorsEnum, LanguagePath } from "@/TickApi";
import TickSelector from "../atoms/TickSelector.vue";


@Component({
  directives: { focus },
  emits: ["select", "close"],
  components: {
    TickSettingsPanel,
    TickInput,
    TickButton,
    TickSelector,
  },
})
export default class TickColorsSwatch extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath

  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private selected!: ColorsEnum;
  private colorOptions: ColorsEnum[][] = getColorOptionsForUI();

  private colorIsSelected(c: ColorsEnum) {
    return this.selected == c;
  }

  private removeColor() {
    this.selectColor(null);
  }

  private getColorName(c: ColorsEnum) {
    return getColorName(c);
  }


  private selectColor(color?: ColorsEnum) {
    this.$emit("select", color);
  }


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
