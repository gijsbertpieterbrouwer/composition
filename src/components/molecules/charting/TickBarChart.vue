<template>
  <div class="chart-container">
    <template v-if="!isLoading && this.hasData">
      <apexchart class="chart" :height="chartHeight" :width="chartWidth" :options="chartOptions" :series="chartSeries" type="bar" />
    </template>

    <template v-if="isLoading">
      <BusyIndicator :loading="isLoading" />
    </template>

    <template v-if="!isLoading && !this.hasData">
      <span class="nodata">{{ $translate(LanguagePath.App_Charting_NoData) }}</span>
    </template>
  </div>
</template>

<!-- <template>
  <Chart v-if="!isLoading && this.chart.chartData.length" :size="size" :data="chart.chartData" :margin="margin" :direction="direction" :axis="axis">
    <template #layers>
      <Grid strokeDasharray="10,10" :hideY="true" />
      <Bar :dataKeys="dataKeys(bar)" :barStyle="{ fill: this.getColor(bar) }" v-for="(bar, index) in this.chart.lineOptions" :key="index" />
    </template>
  </Chart>
</template> -->

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { Area, Bar, Chart, Grid, Line, Tooltip } from 'vue3-charts';
import { Margin } from 'vue3-charts/dist/types';

import { BarChartData, ChartingSizeEnum, ChartValueDataItem, ColorsEnum, LanguagePath, LineOptionsData } from '@/TickApi';
import { getColorHex } from '@/helpers/colorsHelper';
import useViewstateStore, { ThemeEnum } from '@/store/viewstate';
import * as VueApexCharts from "vue3-apexcharts";
import BusyIndicator from '../../atoms/BusyIndicator.vue';
import { ChartSize } from './TickChartBase.vue';

@Component({
  emits: [],
  components: { Chart, Grid, Line, Area, Bar, Tooltip, BusyIndicator, apexchart: VueApexCharts, },
})
export default class TickBarChart extends Vue {
  LanguagePath = LanguagePath
  @Prop({ default: 'horizontal' }) private direction: string;
  @Prop({ default: [] }) private chart: BarChartData;
  @Prop({ default: false }) private isLoading: boolean;



  private get hasData(): boolean {
    return this.chart?.chartData?.length > 0;
  }

  private get chartHeight() {
    return '200px';
  }
  private get chartWidth() {
    return '300px';
  }



  private get chartOptions() {
    if (!this.hasData) { return {}; }
    const textColor = "var(--c-contrast)"
    const colors = [getColorHex(this.chart.color)];
    var strokeWidths = [0]
    var serieFills = null;//this.series.map((p) => this.getSerieOptions(p).fill);

    return {
      forceXAxisUpdate: false,
      chart: {
        type: 'bar', // bar, line, area, heatmap
        stacked: false,
        stackType: 'normal', // normal, 100%
        sparkline: {
          enabled: false,
        },
        redrawOnParentResize: true,
        //width: this.chartWidth || '100%',
        //height: this.chartHeight,
        parentHeightOffset: 0,
        toolbar: {
          show: false,
          autoSelected: null
        },
        animations: {
          enabled: false,
        },
        zoom: {
          type: 'x',
          enabled: false,
          autoScaleYaxis: true,
        },
      },
      //curve: smooth, straight, stepline
      stroke: {
        curve: 'smooth',
        width: strokeWidths,
      },
      plotOptions: {
        bar: {
          columnWidth: '80%', // when not stacked give more room
          distributed: false, // true = each serie has its own bar
          horizontal: false,
          borderRadius: 4,
          borderRadiusApplication: 'around', //end or around
          borderRadiusWhenStacked: 'all', //all or last
          dataLabels: {
            position: 'top', // top, center, bottom
            total: {
              enabled: false,
              style: {
                fontSize: '11px',
                fontWeight: 400
              }
            }
          }
        }
      },
      colors: colors,
      grid: {
        //position: 'front'
        yaxis: {
          lines: {
            show: false,//true,
          }
        },
        xaxis: {
          lines: {
            show: false,//this.showChartDetails,
          }
        },
      },
      forecastDataPoints: {
        count: 0,// the number of points which are forcasting
        fillOpacity: 0.2,
        strokeWidth: 1,
        dashArray: 2,
      },
      legend: {
        show: false,
        showForSingleSeries: true,
        showForNullSeries: false,
        showForZeroSeries: false,
        position: 'bottom',
        offsetY: 8,
        horizontalAlign: 'left',
        floating: false,
        fontSize: '12px',
        // fontFamily: 'Helvetica, Arial',
        //fontWeight: 400,
        labels: {
          colors: textColor,
          useSeriesColors: false
        },
      },
      dataLabels: {
        enabled: false // show label with the value for each data point
      },
      markers: {
        size: 0,
        style: 'hollow',
        strokeColors: colors,
      },
      yaxis: {
        show: false,// this.showChartDetails,
        forceNiceScale: true,
        reversed: false,
        labels: {
          style: {
            colors: textColor,
          },
          show: this.showChartDetails,
          rotate: 0,
          rotateAlways: false,
        },
      },

      xaxis: {
        type: 'numeric',
        //min: this.from?.getTime(),
        //max: this.to?.getTime(),
        labels: {
          style: {
            colors: textColor,
          },
          show: this.showChartDetails,
          rotate: 0,
          rotateAlways: false,
          formatter: (val: number, timestamp: string | Date) => {
            return val.toString();
          }
        },
        axisBorder: {
          show: false,//this.showChartDetails,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: false,//this.showChartDetails,
        },
        tooltip: {
          enabled: false,
        }
      },

      tooltip: {
        theme: this.getChartTheme,
        enabled: true,
        followCursor: false,
        fillSeriesColor: false,
        onDatasetHover: {
          highlightDataSeries: true,
        },
        x: {
          show: true,
          format: 'dd MMM yyyy HH:mm'
        }
      },
      fill: {
        // docs : https://apexcharts.com/docs/options/fill/#gradient
        type: ['solid'], //'gradient', //['solid', 'gradient'], // solid gradient pattern image
        gradient: {
          inverseColors: false,
          shade: 'light',
          type: "vertical",
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0,
          stops: [0, 90, 100]
        }
      },
    };

  }
  private get getChartTheme() {
    switch (useViewstateStore().theme) {
      case ThemeEnum.Daylight: return 'light';
      case ThemeEnum.Midnight: return 'dark';
      default: return 'light';
    }
  }

  private get showChartDetails() {
    return true;
  }

  private getDataItem(item: ChartValueDataItem): { x: string, y: number, fillColor: string } {
    return {
      x: item[this.chart.lineOptions[0].nameKey] || item.name,
      y: item[this.chart.lineOptions[0].valueKey] || item.value,
      fillColor: getColorHex(this.chart.lineOptions[0].color),
    }
  }

  private getBarSerieItems(serie: ChartValueDataItem[]): { name: string, type: string, data: { x: string, y: number }[] } {
    const d: { x: string, y: number }[] = [];//serie.map((p) => {x: p?.name || "", y: p.value});

    for (let index = 0; index < serie.length; index++) {
      const s = serie[index];
      d.push(this.getDataItem(s))
    }


    return {
      name: this.chart.title || "",
      type: 'bar',
      data: d
    }
  }

  private get chartSeries() {
    const yItems = [this.getBarSerieItems(this.chart.chartData)];
    return yItems;
  }



  private getColor(options: LineOptionsData) {
    return getColorHex(options.color || ColorsEnum.Grey);
  }

  private dataKeys(options: LineOptionsData): string[] {
    return [options.nameKey, options.valueKey];
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
// .nodata {
//   font-style: italic;
// }
.chart-container {
  display: block;

  .nodata {
    font-style: italic;
  }

  .chart {
    color: var(--c-base);
  }

}
</style>
