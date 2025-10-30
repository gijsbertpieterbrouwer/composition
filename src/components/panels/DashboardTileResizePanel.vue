<template>
  <TickSettingsPanel :panelOptions="panelOptions" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.DashboardEditor_Tile_SettingsMenu_Resize) }}</template>

    <div class="content">

      <!-- <TickSwitch v-model="maximized">maximize</TickSwitch> -->

      <div class="row" v-for="(row, index) in this.possibleSizes" :key="index">
        <TickButton class="btn" :appearance="optionAppearance(option)" @mouseover="preSelectSize(option)" @click="selectSize(option)" :title="optionTooltip(option)" :disabled="optionDisabled(option)"
          v-for="(option, index) in row" :key="index">
        </TickButton>

      </div>


    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import TickButton, { Appearance, Color, Size } from "../atoms/TickButton.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import { DashboardTileType, LanguagePath } from "@/TickApi";
import { getMinimumTileSize } from "@/helpers/dashboardHelper";

export interface DashboardTileSizeSelection {
  tileId: string,
  selected: boolean,
  disabled: boolean,
  width?: number,
  height?: number,
  highlight?: boolean,
}

@Component({
  directives: { focus },
  emits: ["select", "close"],
  components: {
    TickSettingsPanel,
    TickButton,
    TickSwitch
  },
})
export default class DashboardTileResizePanel extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions
  @Prop() private tileId: string;
  @Prop() private tileType: DashboardTileType;
  @Prop() private currentWidth?: number;
  @Prop() private currentHeight?: number;

  private possibleSizes: DashboardTileSizeSelection[][] = [];

  private get maximized() {
    return this.currentHeight == null && this.currentWidth == null;
  }

  private set maximized(to: boolean) {

    const o: DashboardTileSizeSelection = {
      tileId: this.tileId,
      width: to ? 10 : 6,
      height: to ? 10 : 3,
      disabled: false,
      selected: false,
    }

    this.selectSize(o);

  }
  private optionAppearance(option: DashboardTileSizeSelection): Appearance {
    if (option.selected) { return Appearance.primary; }
    if (option.highlight) { return Appearance.primary }

    return Appearance.secondary
  }
  private optionDisabled(option: DashboardTileSizeSelection): boolean {
    return option.disabled || false;
  }


  private optionTooltip(option: DashboardTileSizeSelection): string {
    return `${option.width} x ${option.height}`;
  }

  private preSelectSize(option: DashboardTileSizeSelection) {

    for (let index = 0; index < this.possibleSizes.length; index++) {
      const row = this.possibleSizes[index];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const col = row[colIndex];

        col.highlight = this.calcOptionIsWithinSelection(option, col.height, col.width);

      }
    }

  }

  private calcOptionIsWithinSelection(preSelection: DashboardTileSizeSelection, height: number, width: number): boolean {
    if (!preSelection) { return false; }

    const withinWidth = !preSelection.width || preSelection.width >= width;
    const withinHeight = !preSelection.height || preSelection.height >= height;

    return withinWidth && withinHeight;
  }


  private selectSize(option: DashboardTileSizeSelection) {
    this.$emit("select", option)
  }


  private maxWidth = 10;
  private maxHeight = 5;


  mounted() {

    const minSize = getMinimumTileSize(this.tileType);

    for (let rowIndex = 1; rowIndex < this.maxHeight + 1; rowIndex++) {
      const row = [];
      for (let colIndex = 1; colIndex < this.maxWidth + 1; colIndex++) {
        const o: DashboardTileSizeSelection = {
          tileId: this.tileId,
          width: colIndex,
          height: rowIndex,
          selected: false,
          disabled: (colIndex <= minSize.w && rowIndex <= minSize.h) && (colIndex < minSize.w || rowIndex < minSize.h),
        }

        // o.selected = (this.currentHeight >= 1 && this.currentWidth >= 1) ? this.calcOptionIsWithinSelection(o, this.currentHeight, this.currentWidth) : false;
        row.push(o);
      }
      this.possibleSizes.push(row);
    }

    const mountSelection: DashboardTileSizeSelection = {
      selected: false,
      tileId: this.tileId,
      height: this.currentHeight,
      width: this.currentWidth,
      disabled: false,
    }
    this.preSelectSize(mountSelection);


  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {



  .row {
    display: grid;
    grid-auto-flow: column;
    gap: 5px;
    margin-bottom: 5px;

    .btn {
      width: 10px;
    }

  }
}
</style>
