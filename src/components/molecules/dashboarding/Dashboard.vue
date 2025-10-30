<template>
  <div class="dashboard-wrapper" :class="{ 'firstTime': isFirstRendering }">
    <div class="header" v-if="showTitle">
      <TickHeading @click="askNewName">{{ dashboardName }}</TickHeading>
    </div>
    <div class="dashboard">

      <div class="tiles">
        <grid-layout :layout="tilesLayout" :autoSize="true" :responsive="false" :col-num="10" :maxRows="20" :row-height="100" :is-draggable="editAllowed" :is-resizable="editAllowed"
          :is-mirrored="false" :prevent-collision="false" :vertical-compact="false" :margin="[10, 10]" :use-css-transforms="true" @layout-updated="layoutUpdatedEvent">

          <grid-item v-for="item in tiles" :x="item.x" :y="item.y" :w="item.width" :h="item.height" :minW="minW(item)" :minH="minH(item)" :i="item.id" :key="item.id" @resize="resizeEvent"
            @resized="resizedEvent" @moved="movedEvent" @move="moveEvent">
            <!-- <div class="demo-tile tile"></div> -->

            <DashboardTile @resize="onResizeTile" @editSettings="startEditTileSettings(item)" @remove="removeTile(item)" class="tile" :class="{ 'drag-handle': editAllowed }" :editable="editAllowed"
              :dashboardId="dashboardId" :data="item" :isResizing="isResizing(item.id)" />

          </grid-item>
        </grid-layout>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { AuthorizationType, ClientAutoRefreshRateEnum, DashboardDataRequest, DashboardTileChartRequest, DashboardTileCounterRequest, DashboardTileHeatmapRequest, DashboardTileMessageboardRequest, DashboardTilePieRequest, DashboardTileResponse, DashboardTileSettings, DashboardTileType, DatawarehousHeatmapDataTileSettings, DatawarehouseChartDataTileSettings, DatawarehouseCounterDataTileSettings, DatawarehousePieDataTileSettings, MessageboardTileSettings, Period, PeriodicTileShowPeriodEnum, TickDashboard } from "@/TickApi";
import TickIcon from '@/components/TickIcon.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading from "@/components/atoms/TickHeading.vue";
import DashboardTileEditorPanel from '@/components/panels/DashboardTileEditorPanel.vue';
import DashboardTileResizePanel, { DashboardTileSizeSelection } from '@/components/panels/DashboardTileResizePanel.vue';
import { authorizationIsSufficient } from '@/helpers/authorizationsHelper';
import { getMinimumTileSize } from '@/helpers/dashboardHelper';
import { GetMinuteInMs, ensureIsDate } from '@/helpers/dateHelper';
import { mount, unmount } from '@/helpers/mountHelper';
import { askNewName } from '@/helpers/questionHelper';
import { debug } from '@/log';
import useDashboardsStore from '@/store/dashboards';
import useUserStore from '@/store/user';
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import { GridItem, GridLayout } from 'vue3-grid-layout-next';
import * as VueDraggable from "vuedraggable";
import DashboardTile from './DashboardTile.vue';
//docs: https://jbaysolutions.github.io/vue-grid-layout/guide/styling.html#placeholder

interface layoutItem {
  x: number,
  y: number
  w: number
  h: number,
  i: string,
}

@Component({
  emits: ["resolve"],
  components: {
    DashboardTile, TickHeading, DashboardTileEditorPanel,
    TickIcon, TickDropdown, VueDraggable,
    DashboardTileResizePanel, TickButton,
    GridLayout,
    GridItem,
  }
})
export default class Dashboard extends Vue {
  Size = Size;
  Appearance = Appearance;
  Color = Color;
  @Prop() private showTitle: Required<boolean>;
  @Prop() private dashboardId: Required<string>;
  @Prop() private disabled: boolean;
  @Prop() private data: TickDashboard;

  private isFirstRendering = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pollerTimer: any = null;
  private lastUpdate: Date = null;

  private activePanel = "";
  private activePanelTileId: string = null;
  private activeResizeTileId: string = null;

  private statisticDefinitionsLoaded = false;

  private isResizing(tileId: string): boolean {
    return this.activeResizeTileId == tileId;
  }


  private get tilesLayout(): layoutItem[] {
    return this.tiles.map((t) => ({
      "x": t.x || 0,
      "y": t.y || 0,
      "w": t.width || 1,
      "h": t.height || 1,
      "i": t.id
    }));
  }

  private layoutUpdatedEvent(newLayout: layoutItem[]) {
    let needsSave = false;
    for (let index = 0; index < newLayout.length; index++) {
      const layoutItem = newLayout[index];

      let tile = this.tiles.find(p => p.id == layoutItem.i);
      if (!tile) { continue; }

      if (tile.height != layoutItem.h) {
        tile.height = layoutItem.h;
        needsSave = true;
      }

      if (tile.width != layoutItem.w) {
        tile.width = layoutItem.w;
        needsSave = true;
      }
      if (tile.x != layoutItem.x) {
        tile.x = layoutItem.x;
        needsSave = true;
      }
      if (tile.y != layoutItem.y) {
        tile.y = layoutItem.y;
        needsSave = true;
      }
    }
    if (needsSave) {
      this.saveDefinition(null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private moveEvent(id: string, newX: number, newY: number) {

    //const msg = "MOVE i=" + id + ", X=" + newX + ", Y=" + newY;
    //console.log(msg);

  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private movedEvent(id: string, newX: number, newY: number) {
    // const msg = "MOVED i=" + id + ", X=" + newX + ", Y=" + newY;
    // console.log(msg);

    // let tile = this.tiles.find(p => p.id == id);
    // if (!tile) { return; }

    // tile.x = newX;
    // tile.y = newY;

    // this.saveDefinition(null);
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private resizeEvent(id: string, newH: number, newW: number, newHPx: number, newWPx: number) {
    //const msg = "RESIZE i=" + id + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx;
    //console.log(msg);

    const e: DashboardTileSizeSelection = {
      selected: false,
      disabled: false,
      tileId: id,
      height: newH,
      width: newW,
    }

    // hide tile content while resizing
    this.activeResizeTileId = id

    this.onResizeTile(e, true);


  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private resizedEvent(id: string, newX: number, newY: number, newHPx: number, newWPx: number) {
    //const msg = "RESIZED i=" + id + ", X=" + newX + ", Y=" + newY + ", H(px)=" + newHPx + ", W(px)=" + newWPx;
    //console.log(msg);
    this.activeResizeTileId = null;

    let tile = this.tiles.find(p => p.id == id);
    if (!tile) { return; }

    const e: DashboardTileSizeSelection = {
      selected: false,
      disabled: false,
      tileId: id,
      height: tile.height,
      width: tile.width,
    }

    this.onResizeTile(e, false);
  }


  private onEndDragTile() {
    this.saveDefinition(null);
  }

  // private addTileFromSelection(type: DashboardTileTemplateType) {
  //   createDashboardTileByTemplate(type).then((tile) => {
  //     this.dashboard.settings.tiles.push(tile);
  //     this.saveDefinition(null);
  //   });
  // }

  // private get newTileOptions(): DropdownOption[] {
  //   return getNewTileTemplateOptions();
  // }

  private get createNewTileData(): DashboardTileSettings {
    return {
      height: 1,
      width: 1,
      id: "custom",
    }
  }


  private get editAllowed() {
    if (!this.dashboard) { return false; }
    if (this.disabled) { return false; }

    const auth = this.dashboard?.authorizationType;
    const isContributer = authorizationIsSufficient(AuthorizationType.Contributor, auth)
    return isContributer;
  }


  private minW(tile: DashboardTileSettings): number {
    const minSize = getMinimumTileSize(tile.type);
    return minSize.w;
  }

  private minH(tile: DashboardTileSettings): number {
    const minSize = getMinimumTileSize(tile.type);
    return minSize.h;
  }

  private startEditTileSettings(tile: DashboardTileSettings) {
    if (!this.editAllowed) { return; }

    if (!this.statisticDefinitionsLoaded) {
      useDashboardsStore().useEditor();
      this.statisticDefinitionsLoaded = true;
    }

    this.openTileSettingsPanel(tile);

  }

  private onResizeTile(selection: DashboardTileSizeSelection, ignoreSave?: boolean) {
    if (!this.editAllowed) { return; }

    let tile = this.tiles.find(p => p.id == selection.tileId);
    if (!tile) { return; }
    // remove tile (fro trickery)

    tile.height = selection.height;
    tile.width = selection.width;

    if (!ignoreSave) {
      this.saveDefinition(tile.id);
    }

    // //Fixme: Trickery to update a chart size without getting an exception
    // if (tile.type == DashboardTileType.Charting) {
    //   // temporarily remove tile and put it back in next tick
    //   this.tiles = this.tiles.filter(p => p.id != tile.id);

    //   this.$nextTick(() => {
    //     this.tiles.push(tile);
    //   });
    // }


  }

  private removeTile(tile: DashboardTileSettings) {
    if (!this.editAllowed) { return; }

    this.tiles = this.tiles.filter(p => p.id != tile.id);
    this.saveDefinition(tile.id);
  }

  private askNewName() {
    if (!this.editAllowed) { return; }

    askNewName((to) => {
      if (to) {
        this.dashboard.name = to;
        this.saveDefinition(null);
      }
    }, this.dashboardName);


  }

  private saveDefinition(tileId?: string) {
    if (!this.editAllowed) { return; }

    useDashboardsStore().saveDashboard(this.dashboard.id).then(() => {
      // check for updates
      this.lastUpdate = null;
      this.checkUpdatesNeeded(tileId);
    });
  }

  private get dashboardName() {
    return this.dashboard?.name || "";
  }

  private get dashboard(): TickDashboard {
    const def = this.data || useUtilityDataStore().dashboard(this.dashboardId) as TickDashboard;
    return def || null;
  }

  private get tiles(): DashboardTileSettings[] {
    return this.dashboard?.settings?.tiles || [];
  }
  private set tiles(to: DashboardTileSettings[]) {
    this.dashboard.settings.tiles = to;
  }

  @Watch("tiles")
  private tilesCountChanged() {
    this.checkUpdatesNeeded();
  }


  private chartTileSettings(tile: DashboardTileSettings): DatawarehouseChartDataTileSettings {
    const json = (tile.tileSettingsJson ? tile.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }
  private heatmapTileSettings(tile: DashboardTileSettings): DatawarehousHeatmapDataTileSettings {
    const json = (tile.tileSettingsJson ? tile.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }
  private getTileData(tileId: string): DashboardTileResponse {
    const tileData = useDashboardsStore().dashboardTileData(this.dashboardId, tileId);
    return tileData;
  }


  private counterTileSettings(tile: DashboardTileSettings): DatawarehouseCounterDataTileSettings {
    const json = (tile.tileSettingsJson ? tile.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }


  private pieTileSettings(tile: DashboardTileSettings): DatawarehousePieDataTileSettings {
    const json = (tile.tileSettingsJson ? tile.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }

  private messageboardTileSettings(tile: DashboardTileSettings): MessageboardTileSettings {
    const json = (tile.tileSettingsJson ? tile.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }
  private getTileNeedsUpdateBecauseOfRefreshPeriod(tileSettings: DashboardTileSettings): boolean {
    var lastData = this.getTileData(tileSettings.id);
    // no data => update
    if (!lastData?.responseDate) { return true; }

    const now = new Date();
    const msSinceLastUpdate: number = (now.getTime() - ensureIsDate(lastData.responseDate).getTime())
    const oneMinuteMs = GetMinuteInMs();

    tileSettings.clientAutoRefreshRate

    switch (tileSettings.clientAutoRefreshRate) {
      case ClientAutoRefreshRateEnum.Minute: return msSinceLastUpdate > (oneMinuteMs * 1)
      case ClientAutoRefreshRateEnum.FiveMinute: return msSinceLastUpdate > (oneMinuteMs * 5)
      case ClientAutoRefreshRateEnum.Never:
      default:
        return false;
    }

  }

  private getTileNeedsUpdateBecauseOfData(tileId: string, settings: DatawarehouseChartDataTileSettings | DatawarehouseCounterDataTileSettings | DatawarehousHeatmapDataTileSettings): boolean {
    var lastData = this.getTileData(tileId);
    // no data => update
    if (!lastData?.responseDate) { return true; }
    const now = new Date();
    const msSinceLastUpdate: number = (now.getTime() - ensureIsDate(lastData.responseDate).getTime())
    const oneMinuteMs = GetMinuteInMs();

    //fixme: add logic to determine if a period has went (are we in the next 5min/hour/week,etc since the last update?) 
    if (settings.showPeriod == PeriodicTileShowPeriodEnum.Custom) {
      return msSinceLastUpdate > (oneMinuteMs * 1);
    } else {

      switch (settings.showResolution) {
        case Period.Minute: return msSinceLastUpdate > (oneMinuteMs * 1)
        case Period.FiveMinutes: return msSinceLastUpdate > (oneMinuteMs * 2)

        case Period.Hour:
        case Period.Day:
        case Period.Week:
        case Period.Month:
        case Period.Year:
          return msSinceLastUpdate > (oneMinuteMs * 10)
      }
    }
  }


  private checkUpdatesNeeded(forceForTileId?: string) {
    if (!this.dashboard) {
      debug("[Dashboard:Update]No dashboard present to check upon")
      return;
    }

    const chartTileRequests: DashboardTileChartRequest[] = [];
    const counterTileRequests: DashboardTileCounterRequest[] = [];
    const pieTileRequests: DashboardTilePieRequest[] = [];
    const messageboardTileRequests: DashboardTileMessageboardRequest[] = [];
    const heatmapTileRequests: DashboardTileHeatmapRequest[] = [];

    const tiles = this.tiles;

    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index];

      if (forceForTileId && tile.id != forceForTileId) { continue; }
      const forceThisTile = forceForTileId && forceForTileId == tile.id;


      const outdated = this.getTileNeedsUpdateBecauseOfRefreshPeriod(tile)


      if (tile.type == DashboardTileType.Charting) {
        const settings = this.chartTileSettings(tile);
        if (!settings) { continue; }

        if (forceThisTile || outdated || this.getTileNeedsUpdateBecauseOfData(tile.id, settings)) {

          chartTileRequests.push({
            tileId: tile.id,
            showPeriod: settings.showPeriod,
            chartDataSeries: settings.chartDataSeries,
            showResolution: settings.showResolution,
            showPeriodCustomDateRange: settings.customDateRangeSettings,
          });
        }
      }



      if (tile.type == DashboardTileType.Counter) {
        const settings = this.counterTileSettings(tile);
        if (!settings) { continue; }

        if (forceThisTile || outdated || this.getTileNeedsUpdateBecauseOfData(tile.id, settings)) {

          counterTileRequests.push({
            tileId: tile.id,
            counter: settings,
          });
        }
      }


      if (tile.type == DashboardTileType.Pie) {
        const settings = this.pieTileSettings(tile);
        if (!settings) { continue; }

        if (forceThisTile || outdated || this.getTileNeedsUpdateBecauseOfData(tile.id, settings)) {

          pieTileRequests.push({
            tileId: tile.id,
            pie: settings,
          });
        }
      }

      if (tile.type == DashboardTileType.Heatmap) {
        const settings = this.heatmapTileSettings(tile);
        if (!settings) { continue; }

        if (forceThisTile || outdated || this.getTileNeedsUpdateBecauseOfData(tile.id, settings)) {

          heatmapTileRequests.push({
            tileId: tile.id,
            heatmap: settings,
          });
        }
      }

      if (tile.type == DashboardTileType.Messageboard) {
        const settings = this.messageboardTileSettings(tile);
        if (!settings) { continue; }

        if (forceThisTile || outdated || this.getTileNeedsUpdateBecauseOfData(tile.id, settings)) {

          messageboardTileRequests.push({
            tileId: tile.id,
            messageboard: settings,
          });
        }
      }


    }

    const request: DashboardDataRequest = {
      dashboardId: this.dashboard.id,
      workspaceId: useUserStore().activeWorkspaceId,
      charts: chartTileRequests,
      counters: counterTileRequests,
      pies: pieTileRequests,
      messageboards: messageboardTileRequests,
      heatmaps: heatmapTileRequests,
    }


    this.lastUpdate = new Date();
    useDashboardsStore().getDashboardData(request)

    // .then((d) => {

    //   this.lastUpdate = new Date();
    // })

  }

  private beforeUnmount() {
    clearTimeout(this.pollerTimer);
  }


  private startPoller() {
    const minute = GetMinuteInMs();
    const twoSec = 2000;

    this.pollerTimer = setTimeout(() => {
      this.checkUpdatesNeeded();
      this.startPoller();
    }, this.lastUpdate ? minute : twoSec);
  }


  mounted() {
    useUtilityDataStore().use(useUserStore().activeWorkspaceId);

    this.startPoller()

    // wait a moment until rendering is done to remove the no-animation from the dashboard to prevent first-render animations
    setTimeout(() => {
      this.isFirstRendering = false;
    }, 100);


  }


  private openTileSettingsPanel(tile: DashboardTileSettings) {
    this.activePanelTileId = tile.id;
    this.toggleTileSettingsPanel(tile.id);
  }

  private toggleTileSettingsPanel(tileId: string) {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.mountTileSettingsPanel(this.dashboard.id, tileId);
    }
  }

  private mountTileSettingsPanel(dashboardId: string, tileId: string) {
    if (this.activePanel) {
      return;
    }

    this.activePanel = mount(DashboardTileEditorPanel, {
      props: {
        dashboardId: dashboardId,
        tileId: tileId,
      },
      events: {
        close: () => {
          this.saveDefinition(this.activePanelTileId);
          this.closePanel();

        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) { return; }

    unmount(this.activePanel);
    this.activePanel = "";
    this.activePanelTileId = null;
  }


}
</script>

<style lang="scss">
.dashboard-wrapper.firstTime {
  .vue-grid-layout {
    transition: none;
  }

  .vue-grid-item {
    transition: none;
  }
}


.vue-resizable-handle {
  visibility: hidden;
  right: 0px !important;
  bottom: 0px !important;
  background: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNiA2IiB2ZXJzaW9uPSIxLjEiCgl4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIgoJeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Igo+Cgk8ZyBvcGFjaXR5PSIwLjMwMiI+CgkJPHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9ImN1cnJlbnRjb2xvciIvPgoJPC9nPgo8L3N2Zz4=") !important;
  background-repeat: no-repeat !important;
  background-position: right bottom;
}

.vue-grid-item:hover {
  .vue-resizable-handle {
    visibility: visible;

  }
}

.vue-grid-item.vue-grid-placeholder {
  background: var(--c-base-500) !important;
  border-radius: 10px;
}

.vue-draggable-dragging {
  opacity: 0.6 !important;
}
</style>

<style lang="scss" scoped>
@import "@/styles/theme";

// .vue-grid-layout {
//   //background: #eee;
// }

.vue-grid-item .resizing {
  opacity: 0.9;
}

// .vue-grid-item:not(.vue-grid-placeholder) {
//   // background: #ccc;
//   // border: 1px solid black;
// }



// .vue-draggable-handle {
//   position: absolute;
//   width: 20px;
//   height: 20px;
//   top: 0;
//   left: 0;
//   background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#fff'/></svg>") no-repeat;
//   background-position: bottom right;
//   padding: 0 8px 8px 0;
//   background-repeat: no-repeat;
//   background-origin: content-box;
//   box-sizing: border-box;
//   cursor: pointer;
// }



.dashboard-wrapper {
  min-width: 400px;

}

.header {
  margin-bottom: 20px;
}

.tiles {
  //display: flex;
  //gap: 10px;
  //flex-flow: row wrap;

  .tile {
    border-radius: 12px;

    font-size: $text-size-regular;
    line-height: 16px;

    // position: relative;
    //border: 1px solid var(--c-base-400);
    color: var(--c-contrast);
    background-color: var(--c-base-100);


    &.demo-tile {
      background-color: red;
    }

    // overflow: hidden; => tooltips of charts are over borders

    &.ghost {
      //background-color: inherit;
      opacity: 0.5;
      border: 1px solid var(--c-base-400);
    }

    &.drag {
      //background-color: inherit;
      opacity: 0.8;
      //border: 1px solid var(--c-base-400);
    }


    &.drag-handle {
      cursor: move;
    }

    &.plus {
      margin-top: 10px;

      &:hover {
        .plus-icon {
          opacity: 0.7;
        }
      }

      display: grid;

      align-items: center;
      justify-items: center;

      .plus-icon {
        width: 100%;
        height: 100%;
        opacity: 0.1;
      }

    }


  }
}
</style>
