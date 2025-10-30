<template>
  <!-- {{ this.timePercentageLeft }} % -->
  <!-- <div class="progress-bar">
    <progress :value="timePercentageLeft" min="0" max="100" style="visibility:hidden;height:0;width:0;">{{ this.timePercentageLeft }}%</progress>
  </div> -->

  <!-- <TickPieChart v-if="showChart" :chart="asChartData" :noMargin="true" :sort="'none'" /> -->
  <!-- <svg class="stat-circle" width="16" viewBox="0 0 20 20">
    <circle class="bg" cx="10" cy="10" r="8"></circle>
    <circle class="progress" cx="10" cy="10" r="8" :data-percentage="timePercentageLeft"></circle>
    <text x="50%" y="55%">{{ this.timePercentageLeft }}%</text>
  </svg> -->


  <svg :height="radius * 2" :width="radius * 2" fill="none" viewBox="0 0 20 20">
    <circle :stroke="strokeColor" fill="transparent" :stroke-dasharray="circumference + ' ' + this.circumference" :style="{ 'strokeDashoffset': this.strokeDashoffset }" :stroke-width="stroke"
      :r="normalizedRadius" :cx="radius" :cy="radius" stroke-linecap="round" />

    <path d="M9 4H11" :stroke="iconColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10 10L11.5 8.5" :stroke="iconColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10 14C12.2091 14 14 12.2091 14 10C14 7.79086 12.2091 6 10 6C7.79086 6 6 7.79086 6 10C6 12.2091 7.79086 14 10 14Z" :stroke="iconColor" stroke-linecap="round" stroke-linejoin="round" />

  </svg>
</template>

<script lang="ts">

import { ColorsEnum } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickPieChart from "../molecules/charting/TickPieChart.vue";
import useAppStore from "@/store/app";
import { getColorHex } from "@/helpers/colorsHelper";
@Component({
  components: { TickPieChart },
})
export default class TickCountdown extends Vue {
  @Prop() private to!: number; // ticks
  @Prop() private from!: number; // ticks

  private radius = 10;
  private stroke = 1;


  private get normalizedRadius() {
    return this.radius - this.stroke;
  }

  private get circumference() {
    return this.normalizedRadius * 2 * Math.PI;
  }

  private get strokeDashoffset() {
    return this.circumference - this.timePercentageLeft / 100 * this.circumference;
  }

  private get nowUtcTicks() {
    return useAppStore().nowUtcTicks;
  }

  private get showChart() {
    return this.timePercentageLeft >= 0;
  }

  private get strokeColor() {
    const color: ColorsEnum = this.timePercentageLeft > 50 ? ColorsEnum.Green
      : this.timePercentageLeft > 25 ? ColorsEnum.Yellow : ColorsEnum.Red;

    return getColorHex(color);
  }

  private get iconColor() {
    return this.timePercentageLeft > 50 ? "var(--c-contrast)" : getColorHex(ColorsEnum.Red);
  }


  private get timePercentageLeft(): number {

    const start = this.from;
    const end = this.to;
    const now = this.nowUtcTicks;

    const l = end - start;

    const onePercent = l / 100;

    let returnValue = 0;
    if (end > now) {
      //time left
      returnValue = (end - now) / onePercent;
    } else {
      //overdue
      returnValue = -1 * ((now - end) / onePercent);
    }


    // return 75; // testing
    return Math.ceil(returnValue);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  stroke-linecap: round;
}
</style>
