<template>
  <div class="chart-container">
    <template v-if="!isLoading && this.hasData">
      <apexchart class="chart" :height="chartHeight" :width="chartWidth" :options="chartOptions" :series="chartSeries" />
    </template>

    <template v-if="isLoading">
      <BusyIndicator :loading="isLoading" />
    </template>

    <template v-if="!isLoading && !this.hasData">
      <span class="nodata">{{ $translate(LanguagePath.App_Charting_NoData) }}</span>
    </template>
  </div>
</template>

<script lang="ts">
import { getColorHex } from '@/helpers/colorsHelper';
import { displayDateWithFormat, getFormattingForTimespane, getTimespan } from '@/helpers/dateHelper';
import { numberToString } from '@/helpers/stringHelper';
import useViewstateStore, { ThemeEnum } from "@/store/viewstate";
import { BarChartData, ChartSerieData, ChartingTypeEnum, LanguagePath, LineChartData, TickStatDataTypeEnum, TimeLineChartData } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import * as VueApexCharts from "vue3-apexcharts";
import BusyIndicator from '../../atoms/BusyIndicator.vue';

export interface ChartOptions {
  width?: number;
  height?: number;
  showDetails?: boolean;
  showStacked?: boolean;
}

@Component({
  emits: [],
  components: {
    BusyIndicator,
    apexchart: VueApexCharts,
  },
})
export default class TickTimelineChart extends Vue {
  ChartingTypeEnum = ChartingTypeEnum;
  LanguagePath = LanguagePath
  @Prop({ default: { width: 500, height: 200 } }) private options: ChartOptions;
  @Prop({ default: [] }) private series: ChartSerieData[];
  @Prop({ default: false }) private isLoading: boolean;
  @Prop() private from: Date;
  @Prop() private to: Date;

  // private renderChart = false;

  // created() {
  //   this.$nextTick(() => {
  //     this.renderChart = true
  //   })
  // }



  private get hasData() {
    return this.series && this.series.length;
  }

  private get chartHeight() {
    return this.options?.height || '100%';
  }
  private get chartWidth() {
    return this.options?.width || '100%';
  }

  private get showChartDetails(): boolean {
    return this.options?.showDetails || false;
  }

  private get showChartStacked(): boolean {
    return this.chartSeries.length > 1 && (this.options?.showStacked || false);
  }

  private get calculatedBarBorderRadius(): number {
    const normalRoundedCorners = 4;
    return this.showChartStacked ? normalRoundedCorners : Math.ceil(normalRoundedCorners / this.series.length);
  }

  private getMinMaxForSeries(series: ChartSerieData[]): { min: number, max: number } {
    let min = null;
    let max = null;


    for (let index = 0; index < series.length; index++) {
      const serie = series[index].chartData;
      if (min == null || serie.min < min) { min = serie.min }
      if (max == null || serie.max > max) { max = serie.max }
    }

    return { min: min, max: max }

  }

  private get yAxisForSeries() {
    const textColor = "var(--c-contrast)";
    const axis = []
    if (!this.showChartDetails) {
      return {
        show: false,
      }
    }

    const numericSeries = this.series.filter(p => p.chartData.dataType == TickStatDataTypeEnum.Number)
    const msSeries = this.series.filter(p => p.chartData.dataType == TickStatDataTypeEnum.DurationInMs)

    const numericalSerienames = numericSeries.map((p) => (p.chartData as TimeLineChartData).title);
    const msSerienames = msSeries.map((p) => (p.chartData as TimeLineChartData).title);

    var numericalMinMax = this.getMinMaxForSeries(numericSeries);
    var msMinMax = this.getMinMaxForSeries(msSeries);

    const numericalAxis = {
      seriesName: numericalSerienames,
      min: numericalMinMax.min,
      max: numericalMinMax.max,
      show: true,
      opposite: false,
      forceNiceScale: true,
      reversed: false,
      formatter: (val: number) => {
        return numberToString(val)
      },
      labels: {
        style: {
          colors: textColor,
        },
        show: this.showChartDetails,
        rotate: 0,
        rotateAlways: false,
      },
    };

    const timeBasedAxis = {
      seriesName: msSerienames,
      min: msMinMax.min,
      max: msMinMax.max,
      show: true,
      opposite: false,
      forceNiceScale: true,
      reversed: false,
      labels: {
        style: {
          colors: textColor,
        },
        formatter: (val: number) => {
          const d = getTimespan(val);
          return `${d.value} ${d.unit}`;
        },
        show: this.showChartDetails,
        rotate: 0,
        rotateAlways: false,
      },
    };

    const hasNumericAxis = numericSeries.length > 0;
    const hasMilisecondsBasedAxis = msSeries.length > 0;
    if (hasNumericAxis && !hasMilisecondsBasedAxis) {
      return numericalAxis

    } else if (!hasNumericAxis && hasMilisecondsBasedAxis) {
      return timeBasedAxis
    } else if (hasNumericAxis && hasMilisecondsBasedAxis) {
      timeBasedAxis.opposite = true;
      return [numericalAxis, timeBasedAxis]
    }





    return axis;
  }

  private get chartOptions() {
    if (!this.hasData) { return {}; }
    const textColor = "var(--c-contrast)"
    const colors = this.series.map((p) => getColorHex(((p.chartData || {}) as TimeLineChartData)?.color));
    var strokeWidths = this.series.map((p) => this.getSerieOptions(p).strokeWidth);
    var serieFills = this.series.map((p) => this.getSerieOptions(p).fill);

    return {
      forceXAxisUpdate: false,
      chart: {
        //id: 'area-datetime',
        //group: 'chart',
        type: 'area', // bar, line, area, heatmap
        stacked: this.showChartStacked,
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
          columnWidth: this.showChartStacked ? '80%' : '80%', // when not stacked give more room
          distributed: false, // true = each serie has its own bar
          horizontal: false,
          borderRadius: this.calculatedBarBorderRadius,
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
            show: this.showChartDetails,
          }
        },
        xaxis: {
          lines: {
            show: false, //this.showChartDetails,
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
        show: this.showChartDetails,
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
      yaxis: this.yAxisForSeries,

      xaxis: {
        type: 'datetime',
        min: this.from?.getTime(),
        max: this.to?.getTime(),
        labels: {
          style: {
            colors: textColor,
          },
          show: this.showChartDetails,
          rotate: 0,
          rotateAlways: false,
          formatter: (val: number, timestamp: string | Date) => {
            return displayDateWithFormat(timestamp, getFormattingForTimespane(this.from, this.to))
          }
        },
        axisBorder: {
          show: this.showChartDetails,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: this.showChartDetails,
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
        type: serieFills, //'gradient', //['solid', 'gradient'], // solid gradient pattern image
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

  private getLineSerieItems(serie: ChartSerieData): { name: string, type: string, data: (string | number)[][] } {
    const serieData = (serie.chartData || { chartData: [] }) as LineChartData;
    const d = serieData.chartData.map((p) => [p?.name || "", p.value]);

    return {
      name: serieData.title || "",
      type: this.getSerieOptions(serie)?.type,
      data: d
    }
  }

  private getBarSerieItems(serie: ChartSerieData): { name: string, type: string, data: (string | number)[][] } {
    const serieData = (serie.chartData || { chartData: [] }) as BarChartData;
    const d = serieData.chartData.map((p) => [p?.name || "", p.value]);

    return {
      name: serieData.title || "",
      type: this.getSerieOptions(serie)?.type,
      data: d
    }
  }

  private getTimeSerieItems(serie: ChartSerieData): { name: string, type: string, data: (string | number)[][] } {
    const serieData = (serie.chartData || { chartData: [] }) as TimeLineChartData;
    const d = serieData.chartData.map((p) => [p.dateUtc, p.value]);

    return {
      name: serieData.title || "",
      type: this.getSerieOptions(serie).type,
      data: d
    }
  }

  private getSerieOptions(serie: ChartSerieData): { strokeWidth: number, type: string, fill: string } {
    switch (serie?.chartData?.chartingType) {
      case ChartingTypeEnum.Bar: return {
        fill: 'solid',
        strokeWidth: 1,
        type: 'bar',
      }
      case ChartingTypeEnum.Line: return {
        fill: 'solid',
        strokeWidth: 3,
        type: 'line',
      }
      case ChartingTypeEnum.Timeline: return {
        fill: 'gradient',
        strokeWidth: 3,
        type: 'area',
      }
      case ChartingTypeEnum.Pie:
      default: return {
        fill: 'gradient',
        strokeWidth: 3,
        type: 'area',
      }
    }
  }


  private getSerieItems(serie: ChartSerieData): { name: string, type: string, data: (string | number)[][] } {
    switch (serie?.chartData?.chartingType) {
      case ChartingTypeEnum.Bar: return this.getBarSerieItems(serie);
      case ChartingTypeEnum.Line: return this.getLineSerieItems(serie);
      case ChartingTypeEnum.Timeline: return this.getTimeSerieItems(serie);
      case ChartingTypeEnum.Pie:
        return null;
    }
  }

  private get chartSeries() {
    const yItems = this.series.map((p) => this.getSerieItems(p));
    return yItems;
  }

}


</script>

<style lang="scss" scoped>
@import "@/styles/theme";

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
