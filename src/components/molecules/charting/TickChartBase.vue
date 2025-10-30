<template>
  <Chart v-if="!isLoading && this.chartData.length" :size="size" :data="chartData" :margin="margin" :direction="direction" :axis="axis">

    <template #layers>
      <Grid strokeDasharray="2,2" />
      <Area :dataKeys="['name', 'avg']" type="monotone" :areaStyle="{ fill: 'url(#grad)' }" />
      <Line :dataKeys="['name', 'avg']" type="monotone" :lineStyle="{
        stroke: '#666666'
      }" />
      <Marker v-if="marker" :value="10" label="Mean." color="black" strokeWidth="2" strokeDasharray="6 6" />
      <defs>
        <linearGradient id="grad" gradientTransform="rotate(90)">
          <stop offset="0%" stop-color="#4EB03B" stop-opacity="1" />
          <stop offset="100%" stop-color="#4EB03B" stop-opacity="0.6" />
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

  <template v-if="isLoading">
    <BusyIndicator :loading="isLoading" />
  </template>

  <template v-if="!isLoading && !this.chartData.length">
    <span class="nodata">no data</span>
  </template>
</template>

<script lang="ts">
import { Area, Chart, Grid, Line, Tooltip } from 'vue3-charts'
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { Margin } from 'vue3-charts/dist/types';
import BusyIndicator from '@/components/atoms/BusyIndicator.vue';


export interface ChartSize {
  width: number;
  height: number;
}

@Component({
  emits: [],
  components: { Chart, Grid, Line, Area, Tooltip, BusyIndicator },
})
export default class TickChartBase extends Vue {
  @Prop({ default: { width: 500, height: 200 } }) private size: ChartSize;
  @Prop({ default: 'horizontal' }) private direction: string;
  @Prop({ default: [] }) private chartData: [];
  @Prop({ default: false }) private isLoading: boolean;

  //private chartData = [];

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
