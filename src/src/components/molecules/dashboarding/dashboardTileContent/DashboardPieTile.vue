<template>
  <div class="wrapper">
    <div class="content">
      <TickHeading class="header" :size="Size.small" :title="titleTooltip">{{ this.title }}</TickHeading>
      <TickPieChart class="chart" :isLoading="loading" :chart="pieChartData" :options="pieOptions" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickChart from "@/components/molecules/charting/TickChart.vue";
import { DashboardTileSettings, DashboardTileChartResponse, DashboardTilePieResponse, PieChartData, DatawarehousePieDataTileSettings, LanguagePath } from "@/TickApi";
import TickPieChart, { PieOptions } from '../../charting/TickPieChart.vue';
import { getDashboardPixelSize } from '@/helpers/dashboardHelper';
import TickHeading, { Size } from "@/components/atoms/TickHeading.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import { Appearance, Color, Size as ButtonSize } from '@/components/atoms/TickButton.vue';
import { displayDate, ensureIsDate } from '@/helpers/dateHelper';
import { translate } from '@/plugins/translatePlugin';
@Component({
  emits: ["resolve"],
  components: { TickChart, TickPieChart, TickHeading, TickDropdown }
})
export default class DashboardPieTile extends Vue {
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

  private get showPieDetails(): boolean {
    const isPortrait = this.definitionData?.height > this.definitionData?.width;
    const isHighEnoughForDetails = this.definitionData?.height > 3;

    const showDetails = (!this.definitionData.height || (this.definitionData.height > 2 && (isPortrait || isHighEnoughForDetails)))
      && (!this.definitionData.width || this.definitionData.width > 2);

    return showDetails
  }

  private get pieOptions(): PieOptions {

    const fillGap = 1;

    return {
      height: this.definitionData.height ? getDashboardPixelSize(this.definitionData.height, fillGap) - this.headerHeight : null,
      width: this.definitionData.width ? getDashboardPixelSize(this.definitionData.width, fillGap) - this.contentPadding : null,
      ignoreSize: true,
      showDetails: this.showPieDetails,
    }
  }
  private get titleTooltip() {
    return `${this.pieSettings.title} ${translate(LanguagePath.App_Charting_UpdatedTo_Text, [{ path: 'to', value: this.feederUpdatedToText }])}`;
  }


  private get title() {
    return `${this.pieSettings.title}`;
  }

  private get feederUpdatedToText() {
    return this.feederUpdatedTo ? displayDate(this.feederUpdatedTo) : "-";
  }

  private get feederUpdatedTo() {
    return this.contentData?.updatedTo
  }

  private get pieSettings(): DatawarehousePieDataTileSettings {
    const json = (this.definitionData ? this.definitionData.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }


  private get tileData(): DashboardTilePieResponse {
    return this.contentData;
  }

  private get pieChartData(): PieChartData {
    const tileData = this.tileData;
    if (!tileData) { return {} }


    return tileData.chartData;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  padding: 12px 0px;
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
      justify-items: center;
    }


  }


  .menu {
    display: inline-block;
  }




}
</style>
