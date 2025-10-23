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
      <EditorMessage v-if="noCountWithTimeBasedStatWarning" title="Are you sure?" message="Are you sure using 'COUNT'? We advice using one of the other options" />
    </TickEditorPanel>

    <TickEditorPanel :name="$translate(LanguagePath.App_ChartingEditor_Appearance_Title)" :noBorder="true">
      <template #explainer>
        <span v-if="isTimeBased">{{ $translate(LanguagePath.App_ChartingEditor_TimeBasedTip_Explanation) }}</span></template>
      <div class="list">
        <template v-for="(item, index) in this.appearanceConditions" :key="index">
          <DashboardCounterTileAppearanceRuleEditor @remove="removeAppearanceCondition(item)" @update:modelValue="onTileSettingsUpdate" v-model="appearanceConditions[index]" />
        </template>

        <TickButton class="add-button" @click="addNewAppearanceCondition" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Add) }}
        </TickButton>
      </div>
    </TickEditorPanel>
  </div>
</template>

<script lang="ts">
import {
  AppearanceCondition, AppearanceConditionOperatorEnum, ChartDataValueTypeEnum, ColorsEnum,
  DatawarehouseCounterDataTileSettings, LanguagePath, Period, PeriodicTileShowPeriodEnum, ShowPeriodCustomDateRangeTypeEnum, TickStatDataTypeEnum
} from "@/TickApi";
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector, { Option } from "@/components/atoms/TickSelector.vue";
import { focus } from "@/directives";
import { getDataValueTypeOptions, getPeriodOptions, getPeriodicTileShowPeriodEnumOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import useDashboardsStore from '@/store/dashboards';
import { Component, VModel, Vue } from 'vue-facing-decorator';
import EditorMessage from '../../EditorMessage.vue';
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
import DashboardCounterTileAppearanceRuleEditor from './DashboardCounterTileAppearanceRuleEditor.vue';

@Component({
  directives: { focus },
  emits: ["update:modelValue"],
  components: { TickInput, TickSelector, TickEditorPanel, TickButton, DashboardCounterTileAppearanceRuleEditor, EditorMessage }
})
export default class DashboardCounterTileEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  PeriodicTileShowPeriodEnum = PeriodicTileShowPeriodEnum
  ShowPeriodCustomDateRangeTypeEnum = ShowPeriodCustomDateRangeTypeEnum
  LanguagePath = LanguagePath
  @VModel({ required: true }) private model!: Required<DatawarehouseCounterDataTileSettings>;

  private onTileSettingsUpdate() {
    this.pushUpdate();
  }

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }

  private get appearanceConditions() {
    return this.model.appearanceConditions || [];
  }

  private get noCountWithTimeBasedStatWarning(): boolean {
    return (this.isTimeBased && this.model.dataValueType == ChartDataValueTypeEnum.Count);
  }


  private removeAppearanceCondition(item: AppearanceCondition) {
    this.model.appearanceConditions = this.model.appearanceConditions.filter(p => p.id != item.id);
  }

  private addNewAppearanceCondition() {
    if (!this.model.appearanceConditions) { this.model.appearanceConditions = []; }

    if (this.model.appearanceConditions) {
      this.model.appearanceConditions.push({
        id: generateId(),
        color: ColorsEnum.BoldLime,
        operator: AppearanceConditionOperatorEnum.GreaterThan,
        validationValue: 0,
      });

      this.model.appearanceConditions = this.model.appearanceConditions.slice(0);
    }
  }

  private get usedStat() {
    const stats = this.statDefinitions;
    return stats.find(p => p.id == this.statId)
  }

  private get isTimeBased(): boolean {
    return this.usedStat?.dataType == TickStatDataTypeEnum.DurationInMs;
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
    this.model.type = stat.dataType

    if (stat?.dataType == TickStatDataTypeEnum.DurationInMs && this.model.dataValueType == ChartDataValueTypeEnum.Count) {
      this.model.dataValueType = ChartDataValueTypeEnum.Average;
    }
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

      list.push({
        text: element.name,
        value: element.id,
      })
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

.add-button {
  margin-top: 10px;
}
</style>
