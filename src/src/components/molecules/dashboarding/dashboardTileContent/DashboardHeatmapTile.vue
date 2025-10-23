<template>
  <div class="wrapper">
    <div class="content">
      <TickHeading class="header" :size="Size.small" :title="titleTooltip">{{ this.title }}</TickHeading>
      <TickHeatmapChart class="chart" :isLoading="loading" :series="series" :color=this.color :options="chartOptions" :from="showChartFrom" :to="showChartTo" :rangeConditions="rangeConditions" />
    </div>
  </div>
</template>

<script lang="ts">
import TickChart from "@/components/molecules/charting/TickChart.vue";
import { ColorsEnum, DashboardTileChartResponse, DashboardTileHeatmapResponse, DashboardTileSettings, DatawarehousHeatmapDataTileSettings, HeatmapChartSerieItem, LanguagePath, RangeAppearanceCondition } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';

import { Appearance, Size as ButtonSize, Color } from '@/components/atoms/TickButton.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading, { Size } from "@/components/atoms/TickHeading.vue";
import { displayDate, ensureIsDate } from '@/helpers/dateHelper';
import { translate } from '@/plugins/translatePlugin';
import TickHeatmapChart, { HeatmapChartOptions } from '../../charting/TickHeatmapChart.vue';

@Component({
  emits: ["resolve"],
  components: { TickChart, TickHeatmapChart, TickHeading, TickDropdown }
})
export default class DashboardHeatmapTile extends Vue {
  Color = Color
  Size = Size
  ButtonSize = ButtonSize
  Appearance = Appearance
  @Prop() private dashboardId: Required<string>;
  @Prop() private definitionData: Required<DashboardTileSettings>;
  @Prop() private contentData: Required<DashboardTileChartResponse>;

  private headerHeight = 40;
  private contentPadding = 20;

  private get showChartFrom(): Date {
    return ensureIsDate(this.contentData?.from) || null
  }
  private get showChartTo(): Date {
    return ensureIsDate(this.contentData?.to) || null
  }

  private get loading(): boolean {
    return this.tileData == null;
  }

  private get chartOptions(): HeatmapChartOptions {
    const showDetails = (!this.definitionData.height || this.definitionData.height > 2) && (!this.definitionData.width || this.definitionData.width > 2);
    //const fillGap = 10;

    return {
      height: null, //this.definitionData.height ? getDashboardPixelSize(this.definitionData.height, fillGap) - this.headerHeight : null,
      width: null,//this.definitionData.width ? getDashboardPixelSize(this.definitionData.width, fillGap) - this.contentPadding : null,
      showDetails: showDetails,
    }
  }
  private get titleTooltip() {
    return `${this.chartSettings.title} ${translate(LanguagePath.App_Charting_UpdatedTo_Text, [{ path: 'to', value: this.feederUpdatedToText }])}`;
  }


  private get title() {
    return `${this.chartSettings.title}`;
  }

  private get feederUpdatedToText() {
    return this.feederUpdatedTo ? displayDate(this.feederUpdatedTo) : "-";
  }

  private get feederUpdatedTo() {
    return this.contentData?.updatedTo
  }

  private get chartSettings(): DatawarehousHeatmapDataTileSettings {
    const json = (this.definitionData ? this.definitionData.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }


  private get tileData(): DashboardTileHeatmapResponse {
    //const tileData = useDashboardsStore().dashboardTileData(this.dashboardId, this.definitionData.id);
    return this.contentData;
  }


  private get series(): HeatmapChartSerieItem[] {
    const tileData = this.tileData;
    if (!tileData) { return [] }

    return tileData.chartData.serieData;
  }

  private get color(): ColorsEnum {
    const tileData = this.tileData;
    if (!tileData) { return ColorsEnum.Grey }

    return this.chartSettings.color;// tileData.chartData.color;
  }
  private get rangeConditions(): RangeAppearanceCondition[] {
    const tileData = this.tileData;
    if (!tileData) { return [] }

    return this.chartSettings.appearanceConditions;// tileData.chartData.color;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  padding: 12px;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  height: 100%;
  grid-template-areas: "content";
  justify-content: left;
  align-items: center;

  .content {
    grid-area: content;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    height: 100%;
    grid-template-areas: "header"
      "chart";
    justify-content: center;
    overflow: hidden;

    .header {

      grid-area: header;
      opacity: 0.7;
      //display: grid;
      justify-content: left;
      padding-left: 10px;
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: calc(100% - 30px);
    }

    .chart {
      grid-area: chart;
      //display: grid;
      justify-content: center;
    }


  }


  .menu {
    display: inline-block;
  }




}
</style>
