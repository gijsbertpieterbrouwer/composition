<template>
  <Chart v-if="!isLoading && this.chart.chartData.length" :size="size" :data="chart.chartData" :margin="margin" :direction="direction" :axis="axis">

    <template #layers>
      <Grid strokeDasharray="10,10" :hideY="true" />

      <Area :dataKeys="dataKeys(line)" v-for="(line, index) in this.chart.lineOptions" :key="index" type="monotone" :areaStyle="{ fill: 'url(#grad' + index + ')' }" />
      <Line :dataKeys="dataKeys(line)" v-for="(line, index) in this.chart.lineOptions" :key="index" type="monotone" :lineStyle="{ stroke: this.getColor(line), strokeWidth: 1 }" />

      <defs v-for="(line, index) in this.chart.lineOptions" :key="index">
        <linearGradient :id="'grad' + index" gradientTransform="rotate(90)">
          <stop offset="0%" :stop-color="getColor(line)" stop-opacity="1" />
          <stop offset="100%" :stop-color="getColor(line)" stop-opacity="0.6" />
        </linearGradient>
      </defs>
    </template>

    <template #widgets>
      <Tooltip :config="{
        name: { hide: true },
        min: { hide: false },
        max: { hide: false },
        avg: { hide: false },
      }" hideLine />
    </template>
  </Chart>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { Area, Chart, Grid, Line, Tooltip } from 'vue3-charts';
import { Margin } from 'vue3-charts/dist/types';

import { ChartingSizeEnum, ColorsEnum, LineChartData, LineOptionsData } from '@/TickApi';
import { getColorHex } from '@/helpers/colorsHelper';
import BusyIndicator from '../../atoms/BusyIndicator.vue';
import { ChartSize } from './TickChartBase.vue';

@Component({
  emits: [],
  components: { Chart, Grid, Line, Area, Tooltip, BusyIndicator },
})
export default class TickLineChart extends Vue {
  @Prop({ default: 'horizontal' }) private direction: string;
  @Prop({ default: [] }) private chart: LineChartData;
  @Prop({ default: false }) private isLoading: boolean;

  private dataKeys(options: LineOptionsData): string[] {
    return [options.nameKey, options.valueKey];
  }

  private getColor(options: LineOptionsData) {
    return getColorHex(options.color || ColorsEnum.Grey);
  }

  private get size(): ChartSize {
    switch (this.chart.chartingSize) {
      case ChartingSizeEnum.Normal:
      default:
        return { height: 200, width: 500 };
    }
  }

  private margin: Margin = {
    left: 0,
    top: 10,
    right: 0,
    bottom: 0
  };

  private axis = {
    primary: {
      type: 'band'
    },
    secondary: {
      domain: ['dataMin', 'dataMax + 0'],
      type: 'linear',
      ticks: 8
    }
  }

}
</script>

<style lang="scss" scoped>
.nodata {
  font-style: italic;
}
</style>
