<template>
  <div class="wrapper">
    <div class="content">
      <TickHeading class="header" :size="Size.small" :title="titleTooltip">{{ this.title }}</TickHeading>
      <TickTimelineChart class="chart" :isLoading="loading" :series="series" :options="chartOptions" :from="showChartFrom" :to="showChartTo" />
    </div>
  </div>
</template>

<script lang="ts">
import { Appearance, Size as ButtonSize, Color } from '@/components/atoms/TickButton.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading, { Size } from "@/components/atoms/TickHeading.vue";
import TickChart from "@/components/molecules/charting/TickChart.vue";
import { getDashboardPixelSize } from '@/helpers/dashboardHelper';
import { displayDate, ensureIsDate } from '@/helpers/dateHelper';
import { translate } from '@/plugins/translatePlugin';
import { ChartSerieData, DashboardTileChartResponse, DashboardTileSettings, DatawarehouseChartDataTileSettings, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickTimelineChart, { ChartOptions } from '../../charting/TickTimelineChart.vue';

@Component({
  emits: ["resolve"],
  components: { TickChart, TickTimelineChart, TickHeading, TickDropdown }
})
export default class DashboardChartingTile extends Vue {
  LanguagePath = LanguagePath
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

  private get chartOptions(): ChartOptions {
    const showDetails = (!this.definitionData.height || this.definitionData.height > 2) && (!this.definitionData.width || this.definitionData.width > 2);
    const fillGap = 10;
    const heightGap = showDetails ? 15 : 5;

    return {
      height: this.definitionData.height ? getDashboardPixelSize(this.definitionData.height, fillGap) - heightGap : null,
      width: null,//this.definitionData.width ? getDashboardPixelSize(this.definitionData.width, fillGap) - this.contentPadding : null,
      showDetails: showDetails,
      showStacked: this.chartSettings?.stackSeries || false,
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

  private get chartSettings(): DatawarehouseChartDataTileSettings {
    const json = (this.definitionData ? this.definitionData.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }


  private get tileData(): DashboardTileChartResponse {
    //const tileData = useDashboardsStore().dashboardTileData(this.dashboardId, this.definitionData.id);
    return this.contentData;
  }


  private get series(): ChartSerieData[] {
    const tileData = this.tileData;
    if (!tileData) { return [] }

    return tileData.series.filter(p => p.chartData);
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
  width: 100%;
  grid-template-areas: "content";
  justify-content: left;
  align-items: center;

  .content {
    grid-area: content;
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    grid-template-areas: "chart";
    width: 100%;
    height: 100%;

    justify-content: center;

    .header {
      position: absolute;
      //grid-area: header;
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
      width: 100%;
      height: 50%;

      //display: grid;
      justify-content: center;
    }


  }


  .menu {
    display: inline-block;
  }




}
</style>
