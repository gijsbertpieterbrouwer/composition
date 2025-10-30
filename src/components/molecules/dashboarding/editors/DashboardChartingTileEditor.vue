<template>
  <div>

    <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)" :noBorder="true">
      <TickInput v-focus v-model="name"> {{ $translate(LanguagePath.App_Title) }}</TickInput>

      <div class=" row">
        <TickSelector v-model="showPeriod" :sort="false" :options="showPeriodOptions">{{ $translate(LanguagePath.App_Charting_Period_Title) }}</TickSelector>
        <TickSelector v-model="showResolution" :sort="false" :options="suitablePeriodOptions">{{ $translate(LanguagePath.App_Charting_Resolution_Title) }}</TickSelector>
      </div>



    </TickEditorPanel>

    <TickEditorPanel :name="$translate(LanguagePath.App_ChartingEditor_CustomDateRanges_Title)" :noBorder="true" v-if="showPeriod == PeriodicTileShowPeriodEnum.Custom">

      <TickSelector v-model="showPeriodCustomDateRange" :options="showPeriodCustomDateRangeOptions">{{ $translate(LanguagePath.App_Charting_DateRange_Custom) }}</TickSelector>

      <div class="row">
        <template v-if="showPeriodCustomDateRange == ShowPeriodCustomDateRangeTypeEnum.Periodic">
          <span>{{ $translate(LanguagePath.App_Charting_CustomDateRange_Title) }}</span>
          <TickInput type="number" max="100" min="1" v-model="customShowPeriodicPeriodCount" />
          <TickSelector v-model="customShowPeriodicPeriod" :options="periodOptions" :sort="false" />
        </template>
        <template v-else>
          <TickInput type="date" v-model="customfixedFromTicks">{{ $translate(LanguagePath.App_Charting_From) }}</TickInput>
          <TickInput type="date" v-model="customfixedToTicks">{{ $translate(LanguagePath.App_Charting_To) }}</TickInput>
        </template>
      </div>
    </TickEditorPanel>

    <TickEditorPanel :name="$translate(LanguagePath.App_ChartingEditor_Series_Title)" :noBorder="true">

      <TickSwitch v-model="stackSeries">{{ $translate(LanguagePath.App_ChartingEditor_StackSeries) }}</TickSwitch>



      <template v-for="(item, index) in this.chartDataSeries" :key="item.id">
        <DashboardChartingTileChartDateSerieEditor @remove="removeSerie(item)" @update:modelValue="serieUpdate" v-model="chartDataSeries[index]" />
      </template>

      <TickButton @click="addNewSerie" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_ChartingEditor_AddSerie_Title) }}</TickButton>
    </TickEditorPanel>
  </div>
</template>

<script lang="ts">
import { ChartDataTileSettingsChartSerieSettings, ChartDataValueTypeEnum, ChartingTypeEnum, ColorsEnum, DatawarehouseChartDataTileSettings, LanguagePath, Period, PeriodicTileShowPeriodEnum, ShowPeriodCustomDateRangeTypeEnum } from "@/TickApi";
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector, { Option } from "@/components/atoms/TickSelector.vue";
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import { focus } from "@/directives";
import { inputValueToServerDateTicks, serverDateToInputValue } from '@/helpers/dateHelper';
import { getPeriodOptions, getPeriodicTileShowPeriodEnumOptions, showPeriodCustomDateRangeOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { Component, VModel, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
import DashboardChartingTileChartDateSerieEditor from './DashboardChartingTileChartDateSerieEditor.vue';

@Component({
  directives: { focus },
  emits: ["update:modelValue"],
  components: { TickInput, TickSelector, TickEditorPanel, DashboardChartingTileChartDateSerieEditor, TickButton, TickSwitch }
})
export default class DashboardChartingTileEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  PeriodicTileShowPeriodEnum = PeriodicTileShowPeriodEnum
  ShowPeriodCustomDateRangeTypeEnum = ShowPeriodCustomDateRangeTypeEnum
  LanguagePath = LanguagePath

  @VModel({ required: true }) private model!: Required<DatawarehouseChartDataTileSettings>;

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }

  private get stackSeries() {
    return this.model?.stackSeries;
  }

  private set stackSeries(to: boolean) {
    this.model.stackSeries = to;
  }

  private get name() {
    return this.model?.title;
  }

  private set name(to: string) {
    this.model.title = to;
  }
  private get showPeriod() {
    return this.model?.showPeriod;
  }
  private set showPeriod(to: PeriodicTileShowPeriodEnum) {
    this.model.showPeriod = to;

    // use nextTick because otherwise vue is not updated correctly
    this.$nextTick(() => {
      const limits = this.resolutionMinMaxPeriod(to);
      if (limits) {
        this.normalizeResolution(limits.min, limits.max);
      }
    })



  }

  private resolutionMinMaxPeriod(input: PeriodicTileShowPeriodEnum): { min: Period, max: Period } {
    switch (input) {
      case PeriodicTileShowPeriodEnum.Last60Min: return { min: Period.Minute, max: Period.FiveMinutes }
      case PeriodicTileShowPeriodEnum.Last24Hours: return { min: Period.FiveMinutes, max: Period.Hour }
      case PeriodicTileShowPeriodEnum.Last30Days: return { min: Period.Hour, max: Period.Week }
      case PeriodicTileShowPeriodEnum.Last365Days: return { min: Period.Day, max: Period.Week }
      default: break;
    }
  }

  private normalizeResolution(min: Period, max: Period) {
    if (this.model.showResolution > max) this.model.showResolution = max;
    if (this.model.showResolution < min) this.model.showResolution = min;
  }



  private get showPeriodOptions(): Option[] {
    return getPeriodicTileShowPeriodEnumOptions(false, true);
  }

  private get showResolution() {
    return this.model?.showResolution;
  }
  private set showResolution(to: Period) {
    this.model.showResolution = to;
  }

  private get periodOptions() {
    return getPeriodOptions();
  }
  private get suitablePeriodOptions() {
    const options = getPeriodOptions();
    const limit = this.resolutionMinMaxPeriod(this.showPeriod);
    if (!limit) { return options; }
    const o = options.filter(p => p.value >= limit.min && p.value <= limit.max);

    return o;
  }
  // private get customDateRangeSettings() {

  //   return this.model?.showPeriodCustomDateRange;
  // }
  // private set customDateRangeSettings(to: ShowPeriodCustomDateRangeSettings) {

  //   this.model.showPeriodCustomDateRange = to;
  // }



  private updateCustomSettings() {
    this.model.customDateRangeSettings = JSON.parse(JSON.stringify(this.model.customDateRangeSettings));
  }


  private get showPeriodCustomDateRange() {
    return this.model.customDateRangeSettings?.showPeriodCustomDateRange;
  }
  private set showPeriodCustomDateRange(to: ShowPeriodCustomDateRangeTypeEnum) {
    this.model.customDateRangeSettings.showPeriodCustomDateRange = to;
    this.updateCustomSettings();
  }
  private get showPeriodCustomDateRangeOptions() {
    return showPeriodCustomDateRangeOptions();
  }

  private get customShowPeriodicPeriod() {
    return this.model.customDateRangeSettings?.showPeriodicPeriod;
  }
  private set customShowPeriodicPeriod(to: Period) {
    this.model.customDateRangeSettings.showPeriodicPeriod = to;
    this.updateCustomSettings();
  }

  private get customShowPeriodicPeriodCount() {
    return this.model.customDateRangeSettings?.showPeriodicPeriodCount;
  }
  private set customShowPeriodicPeriodCount(to: number) {
    this.model.customDateRangeSettings.showPeriodicPeriodCount = to;
    this.updateCustomSettings();
  }

  private get customfixedFromTicks() {
    return serverDateToInputValue(this.model.customDateRangeSettings?.fixedFromTicks);
  }
  private set customfixedFromTicks(to: string) {
    this.model.customDateRangeSettings.fixedFromTicks = inputValueToServerDateTicks(to);
    this.updateCustomSettings();
  }
  private get customfixedToTicks() {
    return serverDateToInputValue(this.model.customDateRangeSettings?.fixedToTicks);
  }
  private set customfixedToTicks(to: string) {
    this.model.customDateRangeSettings.fixedToTicks = inputValueToServerDateTicks(to);
    this.updateCustomSettings();
  }

  private get chartDataSeries() {
    return this.model.chartDataSeries || [];
  }


  private serieUpdate(to: ChartDataTileSettingsChartSerieSettings) {

    let existing = this.model.chartDataSeries.find(p => p.id == to.id);
    existing.title = to.title;
    existing.dataType = to.dataType;
    existing.color = to.color;
    existing.chartingType = to.chartingType;
    existing.dataValueType = to.dataValueType;
    existing.getSeriePerSubjectIfAvailable = to.getSeriePerSubjectIfAvailable;
    this.model.chartDataSeries = this.model.chartDataSeries.slice(0);
    this.pushUpdate();
  }

  private removeSerie(item: ChartDataTileSettingsChartSerieSettings) {
    this.model.chartDataSeries = this.model.chartDataSeries.filter(p => p.id != item.id);
  }

  private addNewSerie() {
    this.model.chartDataSeries.push({
      chartingType: ChartingTypeEnum.Timeline,
      color: ColorsEnum.Yellow,
      dataValueType: ChartDataValueTypeEnum.Average,
      id: generateId(),
      title: "New serie",

    });

    this.model.chartDataSeries = this.model.chartDataSeries.slice(0);
  }



  // private get chartOptions(): ChartOptions {
  //   const showDetails = (!this.definitionData.height || this.definitionData.height > 2) && (!this.definitionData.width || this.definitionData.width > 2);

  //   return {
  //     height: this.definitionData.height ? getDashboardPixelSize(this.definitionData.height, this.tileGap) - this.headerHeight : null,
  //     width: this.definitionData.width ? getDashboardPixelSize(this.definitionData.width, this.tileGap) : null,
  //     showDetails: showDetails,
  //   }
  // }

  // private get title() {
  //   return this.chartSettings.title;
  // }

  // private get chartSettings(): DatawarehouseChartDataTileSettings {
  //   const json = (this.definitionData ? this.definitionData.tileSettingsJson : "{}");
  //   const jsonObj = JSON.parse(json);
  //   return jsonObj;
  // }




}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.row {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: $text-size-regular;

  :first-child {
    flex-grow: 1;
  }
}
</style>
