<template>
  <div>
    <apexchart v-if="!isLoading && this.chartData.length" class="chart" :options="chartOptions" :series="chartSeries" :height="chartHeight" :width="chartWidth"></apexchart>
  </div>
</template>

<script lang="ts">

//import { Area, Chart, Grid, Line, Pie, Responsive, Tooltip } from 'vue3-charts'
import { getColorHex } from '@/helpers/colorsHelper';
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import { ChartingSizeEnum, PieChartData } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import * as VueApexCharts from "vue3-apexcharts";
import BusyIndicator from '../../atoms/BusyIndicator.vue';
import { ChartSize } from './TickChartBase.vue';
export interface PieOptions {
  width?: number;
  height?: number;
  ignoreSize?: boolean;
  showDetails?: boolean;
}


@Component({
  emits: [],
  components: {
    BusyIndicator,
    apexchart: VueApexCharts,
  },
})
export default class TickPieChart extends Vue {
  @Prop({ default: [] }) private chart: PieChartData;
  @Prop({ default: false }) private isLoading: boolean;
  // @Prop({ default: false }) private noMargin: boolean;
  @Prop() private options: PieOptions;
  // @Prop({ default: 'asc' }) private sort: string; //'desc' | 'asc' | 'none' | 'custom'

  // private renderChart = false;

  // created() {
  //   this.$nextTick(() => {
  //     this.renderChart = true
  //   })
  // }


  private defaultSize = 500;
  private get hasData(): boolean {
    return this.chartData && this.chartData.length > 0;
  }

  private get chartHeight() {
    return this.options?.ignoreSize ? '100%' : this.size?.height || '100%';
  }
  private get chartWidth() {
    return this.options?.ignoreSize ? '100%' : this.size?.width || '100%';
  }

  private get chartOptions() {
    if (this.isLoading || !this.hasData) { return {}; }
    const chartLabels = this.chartData.map((p) => p.name || '');
    // const colors = this.chartData.map((p) => getColorHex((p as PieChartData).color));
    const textColor = "var(--c-contrast)";

    const hasCenterSubTitle = !stringIsNullOrEmpty(this.chart.centerSubTitle);


    return {
      chart: {
        type: 'donut',
        animations: {
          enabled: false,
        },
        width: this.chartWidth,
        height: this.chartHeight,
      },
      fill: {
        type: 'solid',
        colors: this.colors, // color for slice
      },
      colors: this.colors, // color used also for tooltip

      tooltip: {
        enabled: true,
        // shared: true,
        y: {
          formatter: (val: string, pointer: { seriesIndex: number }) => {
            return this.chartData[pointer.seriesIndex].tooltip
          },
          title: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            formatter: function (seriesName: string) {
              return ''
            }
          }
        }
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          expandOnClick: false,
          offsetX: 0,
          offsetY: 0,
          customScale: 1,
          dataLabels: {
            offset: 0,
            minAngleToShowLabel: 10
          },
          donut: {
            size: this.slizeSize.toString() + '%',
            labels: {
              show: true,
              name: {
                show: true,
                offsetY: (hasCenterSubTitle ? (this.subtitleSize * 1.5) : 0),
                formatter: () => this.chart.centerSubTitle
              },
              value: {
                show: true,
                fontSize: this.titleSize.toString() + 'px',
                fontFamily: 'Inter',
                fontWeight: 400,
                color: textColor,
                offsetY: hasCenterSubTitle ? -10 : 0
              },
              total: {
                show: true,
                showAlways: true,
                fontSize: this.subtitleSize.toString() + 'px',
                color: textColor,
                fontFamily: 'Inter',
                fontWeight: 100,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                formatter: (w: string) => {
                  return this.chart.centerTitle;
                }
              }
            }

          }
        }
      },
      stroke: {
        show: true,
        width: this.strokeSize,
        colors: ['var(--c-base-100)'],
        //dashArray: 10,
        lineCap: 'round', // butt,square,round
        curve: 'smooth',
      },
      legend: {
        show: this.showChartDetails,
        showForSingleSeries: true,
        //showForNullSeries: false,
        //showForZeroSeries: false,
        position: 'bottom',
        offsetY: 8,
        horizontalAlign: 'left',
        floating: false,
        fontSize: '12px',
        labels: {

          colors: textColor,
          useSeriesColors: false
        },
      },
      labels: chartLabels,
      dataLabels: {
        enabled: false,
        formatter: function (val: string) {
          return val;
        },

      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]

    }
  }

  private get showChartDetails(): boolean {
    return this.options?.showDetails || false;
  }

  private get slizeSize() {
    return 90;



    // return (this.chart.chartingSize == ChartingSizeEnum.Mini || this.chart.chartingSize == ChartingSizeEnum.Small)
    //   ? 85
    //   : 90;
  }

  private get strokeSize() {
    return (this.size.height || this.defaultSize) * 0.02;
  }


  private get titleSize() {
    return (this.size.height || this.defaultSize) / 7;
  }

  private get subtitleSize() {
    return (this.size.height || this.defaultSize) / 10;
  }

  private get size(): ChartSize {
    if (this.options) {
      if (this.options.width && this.options.height) {
        //const minRectangle = Math.min(this.options.width, this.options.height);
        return {
          height: this.options.height,
          width: this.options.width,
        }
      } else {
        return {
          height: null,
          width: null,
        }
      }

    }


    switch (this.chart.chartingSize) {
      case ChartingSizeEnum.Mini:
        return { height: 15, width: 15 };
      case ChartingSizeEnum.Small:
        return { height: 100, width: 100 };
      case ChartingSizeEnum.Normal:
      default:
        return { height: 220, width: 220 };
    }
  }


  // private getYItems(serie: PieChartData): { name: string, data: number[], type: string } {
  //   const d = serie.chartData.map((p) => p.value);

  //   return {
  //     name: serie.centerTitle || "",
  //     type: 'donut',
  //     data: d
  //   }

  // }

  private get chartSeries() {
    if (this.isLoading || !this.hasData) { return []; }
    const yItems = this.chartData.map((p) => p.value) // this.getYItems(this.chartData);
    return yItems;
  }

  private get colors() {
    var colors = this.chartData.map(({ color }) => {
      if (!color) { return getColorHex(null); }
      if (typeof (color) == 'number') {
        return getColorHex(color);
      } else {
        return color;
      }
    })
    return colors;
  }



  //--------------



  // private get hasTooltips(): boolean {
  //   return this.chart?.chartData?.some(p => p.tooltip) ?? false;
  // }


  // private get sizeClass() {
  //   switch (this.chart.chartingSize) {
  //     case ChartingSizeEnum.Mini: return "is-mini";
  //     case ChartingSizeEnum.Small: return "is-small";
  //     case ChartingSizeEnum.Normal:
  //     default:
  //       return "is-normal";
  //   }
  // }

  // private get axis() {
  //   return {
  //     primary: {
  //       hide: true
  //     },
  //     secondary: {
  //       hide: true
  //     }
  //   }
  // }

  // private get centerText(): string {
  //   return this.chart.centerTitle || "";
  // }
  // private get centerSubTitle(): string {
  //   return this.chart.centerSubTitle || "";
  // }

  private get chartData() {
    return this.chart.chartData || [];
  }

  // private get pieStyle() {
  //   switch (this.chart.chartingSize) {
  //     case ChartingSizeEnum.Mini:
  //       return {

  //         innerRadius: 6, // less is thinner
  //         padAngle: 0,
  //         cornerRadius: 2,
  //         colors: this.colors
  //       };
  //     case ChartingSizeEnum.Small:
  //       return {

  //         innerRadius: 35, // less is thinner
  //         padAngle: 0.02,
  //         cornerRadius: 2,
  //         colors: this.colors
  //       };
  //     case ChartingSizeEnum.Normal:
  //     default:
  //       return {
  //         innerRadius: 86, // less is thinner
  //         padAngle: 0.02,
  //         cornerRadius: 2,
  //         colors: this.colors
  //       };
  //   }


  // }

  // private get margin(): Margin {
  //   const m = this.noMargin ? 0 : 20;

  //   return {
  //     left: m,
  //     top: m,
  //     right: m,
  //     bottom: m
  //   }
  // }



  // private get tooltipConfig() {
  //   return {
  //     name: { hide: true },
  //     value: { hide: true },
  //     color: { hide: true },
  //     tooltip: { label: '' }
  //   };
  // }


}
</script>
<style lang="scss">
.apexcharts-tooltip {
  z-index: 10000;
  background: #f3f3f3;
  color: orange;
}
</style>

<style lang="scss" scoped>
.v-tooltip {
  z-index: 10000;
}

.content-body {
  background-color: transparent;

  body {
    background-color: transparent;
    height: 100%;

    .content {
      //display: grid;
      height: 100%;
      width: 100%;

      // padding-top: 25%;
      text-align: center;
      justify-items: center;
      align-items: center;

      .inner-content {
        max-width: 100%;
        overflow: hidden;


      }


      &.is-normal {
        padding: 20px;

        .inner-content {


          .title {
            font-size: 30px;

          }

          .subtitle {
            font-size: 15px;
          }
        }
      }

      &.is-small {
        .inner-content {
          .title {
            font-size: 15px;
          }

          .subtitle {
            font-size: 8px;
          }
        }
      }

      &.is-mini {
        .inner-content {
          display: none;
        }
      }



    }
  }

}
</style>
