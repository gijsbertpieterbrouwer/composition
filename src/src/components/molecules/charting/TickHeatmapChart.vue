<template>
  <div class="chart-container">

    <template v-if="!isLoading && this.hasData">
      <apexchart class="chart" :height="chartHeight" :width="chartWidth" :options="chartOptions" :series="chartSeries" />
    </template>

    <template v-if="isLoading">
      <BusyIndicator :loading="isLoading" />
    </template>

    <template v-if="!isLoading && !this.hasData">
      <span class="no-data">{{ $translate(LanguagePath.App_Charting_NoData) }}</span>
    </template>
  </div>
</template>

<script lang="ts">
import { findMaxValueInList } from '@/helpers/arrayHelper';
import { getColorHex } from '@/helpers/colorsHelper';
import useViewstateStore, { ThemeEnum } from "@/store/viewstate";
import { ChartingTypeEnum, ColorsEnum, HeatmapChartSerieItem, LanguagePath, RangeAppearanceCondition } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import * as VueApexCharts from "vue3-apexcharts";
import BusyIndicator from '../../atoms/BusyIndicator.vue';


export interface HeatmapChartOptions {
  width?: number;
  height?: number;
  showDetails?: boolean;
}

interface heatmapDataItem {
  x: string,
  y: number
}

@Component({
  emits: [],
  components: {
    BusyIndicator,
    apexchart: VueApexCharts,
  },
})
export default class TickHeatmapChart extends Vue {
  ChartingTypeEnum = ChartingTypeEnum;
  LanguagePath = LanguagePath
  @Prop({ default: { width: 500, height: 200 } }) private options: HeatmapChartOptions;
  @Prop({ default: [] }) private series: HeatmapChartSerieItem[];
  @Prop({ default: [] }) private rangeConditions: RangeAppearanceCondition[];
  @Prop() private color: ColorsEnum;
  @Prop({ default: false }) private isLoading: boolean;


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

  private get calculatedBarBorderRadius(): number {
    return Math.round(10 / this.series.length);
  }

  private ensureHexColor(input: ColorsEnum): string {
    let varName = getColorHex(input);
    varName = varName.replace("var(", "");
    varName = varName.replace(")", "");

    const hex = getComputedStyle(document.documentElement).getPropertyValue(varName);
    return hex;
  }

  private get serieColors(): string[] {

    var s = [];
    for (let index = 0; index < this.series.length; index++) {
      if (this.color == ColorsEnum.Grey) {
        s.push("#ffffff");
      } else {
        s.push(this.ensureHexColor(this.color));
      }
    }

    return s;//[this.ensureHexColor(this.color)]; //[getColorHex(d?.color)];
  }

  private get highestKnownChartValue() {
    let highestValue = 0;
    for (let index = 0; index < this.series.length; index++) {
      const serie = this.series[index];

      const maxInSerie = findMaxValueInList(serie.chartData, 'value')
      highestValue = Math.max(highestValue, maxInSerie);
    }
    return highestValue;
  }

  private get chartOptions() {
    if (!this.hasData) { return {}; }
    const textColor = "var(--c-contrast)"
    const colors = this.serieColors;
    //var strokeWidths = this.series.map((p) => this.getSerieOptions(p).strokeWidth);
    // var serieFills = this.series.map((p) => this.getSerieOptions(p).fill);
    //const strokeColor = getComputedStyle(document.documentElement).getPropertyValue("--c-base-100")

    let highestValue = this.highestKnownChartValue;

    return {
      forceXAxisUpdate: false,
      chart: {
        //id: 'area-datetime',
        //group: 'chart',
        type: 'heatmap', // bar, line, area, heatmap
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

      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 1,
          radius: 0,
          enableShades: true,
          reverseNegativeShade: true,
          distributed: false,
          useFillColorAsStroke: true,
          colorScale: {
            ranges: this.ranges,
            min: 0,
            max: highestValue,
          }
        }
      },
      colors: colors,

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

      tooltip: {
        theme: this.getChartTheme,
        enabled: true,
        shared: true,
        followCursor: false,
        fillSeriesColor: false,
        onDatasetHover: {
          highlightDataSeries: true,
        },
        x: {
          show: true,
          format: undefined,
          formatter: (value: string) => `Hour: ${value}`,
        },
        y: {
          formatter: undefined,
          title: {
            formatter: (seriesName: string) => seriesName,
          },
        },
        z: {
          formatter: undefined,
          title: 'Size: '
        },
      },
      // stroke: {
      //   width: 0,
      //   colors: [strokeColor],
      // },
      dataLabels: {
        enabled: false, // show label on each cell
      },
    };

  }

  private get ranges(): { from: number, to: number, color: string, name: string }[] {
    const r = this.rangeConditions || [];
    const ranges = (r).map((p) => {
      return {
        from: p.fromValue,
        to: p.toValue || this.highestKnownChartValue,
        color: this.ensureHexColor(p.color),
        name: p.name,
      }
    });

    return ranges;
  }

  private get getChartTheme(): string {
    switch (useViewstateStore().theme) {
      case ThemeEnum.Daylight: return 'light';
      case ThemeEnum.Midnight: return 'dark';
      default: return 'light';
    }

  }

  // private getHeatmapSerieItems(serie: ChartSerieData): { name: string, type: string, data: (string | number)[][] } {
  //   const serieData = (serie.chartData || { chartData: [] }) as TimeLineChartData;
  //   const d = serieData.chartData.map((p) => [p.dateUtc, p.value]);

  //   return {
  //     name: serieData.title || "",
  //     type: this.getSerieOptions(serie).type,
  //     data: d
  //   }
  // }

  // private getSerieOptions(serie: ChartSerieData): { strokeWidth: number, type: string, fill: string } {
  //   switch (serie?.chartData?.chartingType) {
  //     case ChartingTypeEnum.Bar: return {
  //       fill: 'solid',
  //       strokeWidth: 0,
  //       type: 'bar',
  //     }
  //     case ChartingTypeEnum.Line: return {
  //       fill: 'solid',
  //       strokeWidth: 3,
  //       type: 'line',
  //     }
  //     case ChartingTypeEnum.Timeline: return {
  //       fill: 'gradient',
  //       strokeWidth: 3,
  //       type: 'area',
  //     }
  //     case ChartingTypeEnum.Heatmap: return {
  //       fill: 'solid',
  //       strokeWidth: 0,
  //       type: 'bar',
  //     }
  //     case ChartingTypeEnum.Pie:
  //     default: return {
  //       fill: 'gradient',
  //       strokeWidth: 3,
  //       type: 'area',
  //     }
  //   }
  // }


  // private getSerieItems(serie: ChartSerieData): { name: string, type: string, data: (string | number)[][] } {
  //   return this.getHeatmapSerieItems(serie);
  // }

  private get chartSeries() {
    // return [
    //   {
    //     name: "monday",
    //     data: [
    //       { x: "09:00", y: 20 },
    //       { x: "10:00", y: 10 },
    //       { x: "11:00", y: 5 },
    //       { x: "12:00", y: 22 },
    //       { x: "13:00", y: 3 },
    //     ]
    //   },
    //   {
    //     name: "tuesday",
    //     data: [
    //       { x: "09:00", y: 2 },
    //       { x: "10:00", y: 4 },
    //       { x: "11:00", y: 2 },
    //       { x: "12:00", y: 17 },
    //       { x: "13:00", y: 2 },
    //     ]
    //   },
    //   {
    //     name: "wednesday",
    //     data: [
    //       { x: "09:00", y: 1 },
    //       { x: "10:00", y: 12 },
    //       { x: "11:00", y: 33 },
    //       { x: "12:00", y: 32 },
    //       { x: "13:00", y: 1 },
    //     ]
    //   }
    // ]



    const series = this.series.map((p) => this.getSerieItems(p));


    return series;
  }



  private getSerieItems(serie: HeatmapChartSerieItem): { name: string, data: heatmapDataItem[] } {
    const serieData: heatmapDataItem[] = [];
    for (let index = 0; index < serie.chartData.length; index++) {
      const element = serie.chartData[index];
      serieData.push({
        x: element.name,
        y: element.value
      });

    }

    return {
      name: serie.name || "-",
      data: serieData
    }
  }

}


</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.chart-container {
  display: block;

  .no-data {
    font-style: italic;
  }

  .chart {
    color: var(--c-base);
  }

}
</style>
