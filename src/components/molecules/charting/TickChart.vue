<template>
  <div class="chart-container">

    <template v-if="!isLoading && this.chart.chartData">
      <TickPieChart v-if="chart.chartingType == ChartingTypeEnum.Pie" :chart="chart" />
      <TickLineChart v-if="chart.chartingType == ChartingTypeEnum.Line" :chart="chart" />
      <TickBarChart v-if="chart.chartingType == ChartingTypeEnum.Bar" :chart="chart" />
      <TickTimelineChart v-if="chart.chartingType == ChartingTypeEnum.Timeline" :series="asTimelineChartSeries" :options="timelineChartOptions" />
    </template>

    <template v-if="isLoading">
      <BusyIndicator :loading="isLoading" />
    </template>

    <template v-if="!isLoading && !this.chart.chartData">
      <span class="nodata">{{ $translate(LanguagePath.App_Charting_NoData) }}</span>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';

import { ChartingTypeEnum, IChartData, ChartSerieData, LanguagePath } from '@/TickApi';
import TickPieChart from './TickPieChart.vue';
import TickLineChart from './TickLineChart.vue';
import TickBarChart from './TickBarChart.vue';
import BusyIndicator from '../../atoms/BusyIndicator.vue';
import TickTimelineChart, { ChartOptions } from './TickTimelineChart.vue';
import generateId from '@/helpers/guid';

export interface ChartSize {
  width: number;
  height: number;
}

@Component({
  emits: [],
  components: { TickPieChart, TickLineChart, TickBarChart, BusyIndicator, TickTimelineChart },
})
export default class TickChart extends Vue {
  LanguagePath = LanguagePath
  ChartingTypeEnum = ChartingTypeEnum;
  @Prop({ default: { width: 500, height: 200 } }) private size: ChartSize;
  @Prop({ default: [] }) private chart: IChartData;
  @Prop({ default: false }) private isLoading: boolean;


  private get timelineChartOptions(): ChartOptions {
    return {
      height: this.size.height,
      width: this.size.width,
      showDetails: false,
      showStacked: true,
    }
  }
  private get asTimelineChartSeries(): ChartSerieData[] {
    return [{
      id: generateId(),
      chartData: this.chart
    }]
  }


}
</script>

<style scoped></style>

<style lang="scss" scoped>
.chart-container {
  display: inline-block;

  .nodata {
    font-style: italic;
  }

}
</style>
