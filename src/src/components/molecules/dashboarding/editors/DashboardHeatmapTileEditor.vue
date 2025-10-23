<template>
  <div>
    <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)" :noBorder="true">
      <TickInput v-focus v-model="name">{{ $translate(LanguagePath.App_Title) }}</TickInput>
      <TickSelector v-model="showPeriod" :options="showPeriodOptions" :sort="false">{{ $translate(LanguagePath.App_Charting_Period_Title) }}</TickSelector>
      <TickSelector v-model="showResolution" :options="periodOptions" :sort="false">{{ $translate(LanguagePath.App_Charting_Resolution_Title) }}</TickSelector>
    </TickEditorPanel>

    <TickEditorPanel :name="$translate(LanguagePath.App_Charting_Statistic_Title)" :noBorder="true">
      <TickSelector v-model="statId" :options="statOptions">{{ $translate(LanguagePath.App_Charting_Statistic_Title) }}</TickSelector>
      <TickSelector v-model="dataValueType" :sort="false" :options="dataValueTypeOptions">{{ $translate(LanguagePath.App_Charting_Statistic_ValueToPresent) }}</TickSelector>
      <TickColorSelector v-model="color" :allowAsSubDialog="true">{{ $translate(LanguagePath.Color) }}</TickColorSelector>
    </TickEditorPanel>

    <TickEditorPanel :name="$translate(LanguagePath.App_ChartingEditor_Appearance_Title)" :noBorder="true">
      <template #explainer>
        <span v-if="isTimeBased">{{ $translate(LanguagePath.App_ChartingEditor_TimeBasedTip_Explanation) }}</span></template>

      <div class="list">
        <template v-for="(item, index) in this.appearanceConditions" :key="index">
          <DashboardHeatmapTileAppearanceRuleEditor @remove="removeAppearanceCondition(item)" @update:modelValue="onTileSettingsUpdate" v-model="appearanceConditions[index]" />
        </template>

        <TickButton class="add-button" @click="addNewAppearanceCondition" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast">Add</TickButton>
      </div>
    </TickEditorPanel>
  </div>
</template>

<script lang="ts">
import { ChartDataValueTypeEnum, ColorsEnum, DatawarehousHeatmapDataTileSettings, LanguagePath, Period, PeriodicTileShowPeriodEnum, RangeAppearanceCondition, ShowPeriodCustomDateRangeTypeEnum, TickStatDataTypeEnum } from "@/TickApi";
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector, { Option } from "@/components/atoms/TickSelector.vue";
import { focus } from "@/directives";
import { getDataValueTypeOptions, getPeriodOptions, getPeriodicTileShowPeriodEnumOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import useDashboardsStore from '@/store/dashboards';
import { Component, VModel, Vue } from 'vue-facing-decorator';
import TickColorSelector from '../../Selectors/TickColorSelector.vue';
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
import DashboardHeatmapTileAppearanceRuleEditor from './DashboardHeatmapTileAppearanceRuleEditor.vue';

@Component({
  directives: { focus },
  emits: ["update:modelValue"],
  components: { TickInput, TickSelector, TickEditorPanel, TickButton, TickColorSelector, DashboardHeatmapTileAppearanceRuleEditor }
})
export default class DashboardHeatmapTileEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  PeriodicTileShowPeriodEnum = PeriodicTileShowPeriodEnum
  ShowPeriodCustomDateRangeTypeEnum = ShowPeriodCustomDateRangeTypeEnum
  LanguagePath = LanguagePath
  @VModel({ required: true }) private model!: Required<DatawarehousHeatmapDataTileSettings>;

  private onTileSettingsUpdate() {
    this.pushUpdate();
  }

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }
  private get appearanceConditions() {
    return this.model.appearanceConditions || [];
  }

  private get usedStat() {
    const stats = this.statDefinitions;
    return stats.find(p => p.id == this.statId)
  }

  private get isTimeBased(): boolean {
    return this.usedStat?.dataType == TickStatDataTypeEnum.DurationInMs;
  }


  private removeAppearanceCondition(item: RangeAppearanceCondition) {
    this.model.appearanceConditions = this.model.appearanceConditions.filter(p => p.id != item.id);
  }

  private addNewAppearanceCondition() {
    if (!this.model.appearanceConditions) { this.model.appearanceConditions = []; }

    // const toValues: number[] = this.model.appearanceConditions.map((p) => {
    //   return p.toValue;
    // })

    const rangeInterval = 20;
    let newFromVal = 0;
    let newToVal = newFromVal + rangeInterval;
    var previousRow = this.model.appearanceConditions[this.model.appearanceConditions.length - 1];
    if (previousRow) {
      newFromVal = previousRow.toValue;
      newToVal = newFromVal + (previousRow.toValue - previousRow.fromValue)
    }


    if (this.model.appearanceConditions) {
      this.model.appearanceConditions.push({
        id: generateId(),
        color: ColorsEnum.Lime,
        fromValue: newFromVal,
        toValue: newToVal,
        name: "",
      });

      this.model.appearanceConditions = this.model.appearanceConditions.slice(0);
    }
  }

  private get color() {
    return this.model?.color;
  }

  private set color(to: ColorsEnum) {
    this.model.color = to ?? ColorsEnum.Grey;
    //this.onTileSettingsUpdate();
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
  }

  private get showPeriodOptions(): Option[] {
    return getPeriodicTileShowPeriodEnumOptions(true, false);
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

  private get statId() {
    return this.model?.statId;
  }


  private set statId(to: string) {
    const stat = this.getStatDef(to);

    this.model.statId = to;
    this.model.dataType = stat.dataType;

    if (stat?.dataType == TickStatDataTypeEnum.DurationInMs && this.model.dataValueType == ChartDataValueTypeEnum.Count) {
      this.model.dataValueType = ChartDataValueTypeEnum.Average;
    }
    //this.pushUpdate();
  }

  private getStatDef(statId: string) {
    return this.statDefinitions.find(p => p.id == statId);
  }


  private get statDefinitions() {
    return useDashboardsStore().dashboardStatisticDefinitions
  }

  private get statOptions(): Option[] {
    const list: Option[] = [];

    for (let index = 0; index < this.statDefinitions.length; index++) {
      const element = this.statDefinitions[index];
      if (element.hasStatsPerSubject) {
        list.push({
          text: element.name,
          value: element.id,
        })
      }
    }

    return list;
  }


  private get dataValueType() {
    return this.model?.dataValueType;
  }

  private set dataValueType(to: ChartDataValueTypeEnum) {
    this.model.dataValueType = to;
    // this.pushUpdate();
  }
  // private get dataValueTypeOptions() {
  //   return getDataValueTypeOptions()
  // }
  private get dataValueTypeOptions() {
    const stat = this.getStatDef(this.statId);
    const all = getDataValueTypeOptions();
    return stat?.dataType == TickStatDataTypeEnum.DurationInMs
      ? all.filter(p => p.value != ChartDataValueTypeEnum.Count)
      : all;
  }




}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.row {
  display: flex;
  gap: 10px;

}

.list {
  display: grid;
  gap: 5px;
}
</style>
