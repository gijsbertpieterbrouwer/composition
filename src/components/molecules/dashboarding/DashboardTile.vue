<template>
  <div class="tile-viewer" :style="{ height: this.height }" :class="getCssClasses">
    <div class="actions-bar" v-if="editable">
      <TickDropdown ref="dropdown" icon="morevertical" :asButton="true" @select="selectMenuItem" :size="Size.mini" :appearance="Appearance.transparent" :color="Color.primary" :placeholder="''"
        :options="tileSettingsMenuOptions" :dropdownTitle="''" :noFilter="true" />
    </div>

    <div class="message" v-if="hasMessage"> {{ this.message }} </div>

    <template v-if="rendered">

      <DashboardChartingTile :class="{ 'fade': this.hasMessage }" :dashboardId="dashboardId" :definitionData="data" :contentData="tileData" v-if="data.type == DashboardTileType.Charting" />
      <DashboardHeatmapTile :class="{ 'fade': this.hasMessage }" :dashboardId="dashboardId" :definitionData="data" :contentData="tileData" v-if="data.type == DashboardTileType.Heatmap" />
      <DashboardCounterTile :class="{ 'fade': this.hasMessage }" :dashboardId="dashboardId" :definitionData="data" :contentData="tileData" v-if="data.type == DashboardTileType.Counter" />
      <DashboardPieTile :class="{ 'fade': this.hasMessage }" :dashboardId="dashboardId" :definitionData="data" :contentData="tileData" v-if="data.type == DashboardTileType.Pie" />
      <DashboardMessageboardTile :class="{ 'fade': this.hasMessage }" :dashboardId="dashboardId" :definitionData="data" :contentData="tileData" v-if="data.type == DashboardTileType.Messageboard" />

    </template>

    <div v-if="data.id == 'custom'">
      <slot />
    </div>

  </div>
</template>

<script lang="ts">
import { DashboardTileResponse, DashboardTileSettings, DashboardTileType, LanguagePath } from "@/TickApi";
import TickIcon from '@/components/TickIcon.vue';
import { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickDropdown, { DropdownOption, DropdownOptionType } from '@/components/atoms/TickDropdown.vue';
import { TickPanelOptions } from '@/components/atoms/TickPanel.vue';
import DashboardTileResizePanel, { DashboardTileSizeSelection } from '@/components/panels/DashboardTileResizePanel.vue';
import { getDashboardPixelSizeAsString } from '@/helpers/dashboardHelper';
import { mount, unmount } from '@/helpers/mountHelper';
import { getRefElementDOMRect } from '@/helpers/refHelpers';
import { translate } from '@/plugins/translatePlugin';
import useDashboardsStore from '@/store/dashboards';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import DashboardChartingTile from './dashboardTileContent/DashboardChartingTile.vue';
import DashboardCounterTile from './dashboardTileContent/DashboardCounterTile.vue';
import DashboardHeatmapTile from './dashboardTileContent/DashboardHeatmapTile.vue';
import DashboardMessageboardTile from './dashboardTileContent/DashboardMessageboardTile.vue';
import DashboardPieTile from './dashboardTileContent/DashboardPieTile.vue';


//const emitters = tileMenuOptions.map(p => p.id) as string[];


@Component({
  emits: ["editSettings", "resize", "remove"],
  components: { DashboardChartingTile, DashboardCounterTile, TickDropdown, TickIcon, DashboardPieTile, DashboardMessageboardTile, DashboardHeatmapTile }
})
export default class DashboardTile extends Vue {
  Color = Color
  Size = Size
  Appearance = Appearance
  DashboardTileType = DashboardTileType;
  @Prop() private data: Required<DashboardTileSettings>;
  @Prop() private dashboardId: Required<string>;
  @Prop() private editable: Required<boolean>;
  @Prop() private isResizing: boolean;

  private _tileGap = 10;
  private activePanel = "";
  private rendered = false;

  mounted() {
    // wat one ms for the columns to be rendered in the correct width to avoid charts beeing only 20px width before updating with server data
    setTimeout(() => {
      this.rendered = true;
    }, 1);
  }



  private get tileMenuOptions(): DropdownOption[] {
    return [{
      id: "editSettings",
      text: translate(LanguagePath.DashboardEditor_Tile_SettingsMenu_EditSettings),
      icon: "settings",
    },
    {
      id: "resize",
      text: translate(LanguagePath.DashboardEditor_Tile_SettingsMenu_Resize),
      icon: "resize",
      data: {
        noEmit: true,
      }
    },
    {
      type: DropdownOptionType.spacer,
      id: "-",
      text: "",
      icon: "",
    },
    {
      id: "remove",
      text: translate(LanguagePath.DashboardEditor_Tile_SettingsMenu_Remove),
      icon: "delete",
    },
    ]
  }
  private get height() {
    return getDashboardPixelSizeAsString(this.data.height, this._tileGap);

  }

  private get width() {
    return getDashboardPixelSizeAsString(this.data.width, this._tileGap);
  }

  private get getCssClasses(): string[] {
    const r = [];
    if (!this.data.width) { r.push("full-width") }
    if (!this.data.height) { r.push("full-height") }

    return r;
  }


  private get tileData(): DashboardTileResponse {
    const tileData = useDashboardsStore().dashboardTileData(this.dashboardId, this.data.id);
    return tileData;
  }

  private get hasMessage(): boolean {
    return this.tileData != null && this.tileData.message != null && this.tileData.message != "";
  }
  private get message(): string {
    return this.hasMessage ? this.tileData.message : "";
  }

  private get tileSettingsMenuOptions(): DropdownOption[] {
    // add to selectMenuItem;
    return this.tileMenuOptions;
  }

  private selectMenuItem(id: string) {
    const item = this.tileMenuOptions.find(p => p.id == id);

    const d: {
      noEmit?: boolean
    } = item.data;

    if (!d || !d.noEmit) {
      this.$emit(item.id as string);
    } else {


      if (item.id == 'resize') {
        this.openTileResizePanel(this.data);
      }


    }

  }


  private openTileResizePanel(tile: DashboardTileSettings) {
    this.toggleTileResizePanel(tile.id, tile.type);
  }

  private toggleTileResizePanel(tileId: string, tileType: DashboardTileType) {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.mountTileResizePanel(tileId, tileType);
    }
  }

  private mountTileResizePanel(tileId: string, tileType: DashboardTileType) {
    if (this.activePanel) {
      return;
    }


    const panelOptions: TickPanelOptions = {
      title: "DashboardTileResizePanel",
      from: getRefElementDOMRect(this, "dropdown")
    }

    this.activePanel = mount(DashboardTileResizePanel, {
      props: {
        panelOptions: panelOptions,
        tileId: tileId,
        tileType: tileType,
        currentWidth: this.data.width,
        currentHeight: this.data.height,
      },
      events: {
        close: () => {
          this.closePanel();
          // this.saveDefinition(this.activePanelTileId);
        },
        select: (size: DashboardTileSizeSelection) => {
          this.closePanel();
          this.$emit("resize", size);
        },

      },
    });
  }

  private closePanel() {
    if (!this.activePanel) { return; }

    unmount(this.activePanel);
    this.activePanel = "";
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.tile-viewer {
  //overflow: hidden; => tooltips of charts
  border-radius: 12px;



  &.full-width {
    flex: 0 0 100%;
    /* Let it fill the entire space horizontally */
    width: 100%;
  }

  &.full-height {
    height: 100dvh;
  }

  .fade {
    opacity: 0.3;
  }

  .message {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    border: none;
    width: 100%;
    height: 100%;
    background-color: var(--c-base-hsl);
    display: grid;
    align-content: center;
    justify-content: center;
    text-align: center;
    padding: 10px;
    opacity: 0.7;

    font-size: 1em;


  }

  .actions-bar {
    width: 30px;
    z-index: 10000;
    visibility: hidden;
    // opacity: 0.5;
    //display: inline-flex;

    position: absolute;
    right: 5px;
    top: 5px;
  }

  &:hover {
    .actions-bar {
      visibility: visible;
      //  opacity: 1;
    }
  }




}
</style>
