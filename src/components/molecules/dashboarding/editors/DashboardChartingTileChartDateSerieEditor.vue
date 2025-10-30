<template>
  <TickEditorPanel :name="name" :noBorder="true">
    <template #actions>
      <TickButton @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
    </template>



    <TickSelector v-model="statId" :options="statOptions">{{ $translate(LanguagePath.App_Charting_Statistic_Title) }}</TickSelector>
    <TickSwitch v-if="statHasDataPerSubject" v-model="getSeriePerSubjectIfAvailable">{{ $translate(LanguagePath.App_Charting_Statistic_AutoColorPerSubject_Title, [{
      path: 'name',
      value: this.statSubjectTypeName
    }]) }}</TickSwitch>

    <!-- <TickInput v-model="name" placeholder="name">Name </TickInput> -->

    <div class="row">

      <TickSelector v-model="dataValueType" :options="dataValueTypeOptions"> {{ $translate(LanguagePath.App_Charting_YAxis_Value) }}</TickSelector>
      <TickSelector v-model="chartingType" :options="chartingTypeOptions">{{ $translate(LanguagePath.App_Charting_PresentationType) }}</TickSelector>
      <TickSelector v-if="!(this.statHasDataPerSubject && this.getSeriePerSubjectIfAvailable)" v-model="color" :options="colorOptions">{{ $translate(LanguagePath.Color) }}</TickSelector>
    </div>



  </TickEditorPanel>
</template>

<script lang="ts">
import { ChartDataTileSettingsChartSerieSettings, ChartDataValueTypeEnum, ChartingTypeEnum, ColorsEnum, LanguagePath, TickStatDataTypeEnum, TickStatSubjectType } from "@/TickApi";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector, { Option } from "@/components/atoms/TickSelector.vue";
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import { getChartingTypeOptions, getColorOptions, getDataValueTypeOptions } from '@/helpers/enumsHelper';
import { translate } from '@/plugins/translatePlugin';
import useDashboardsStore from '@/store/dashboards';
import { Component, VModel, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
@Component({
  emits: ["update:modelValue", "remove"],
  components: { TickInput, TickSelector, TickEditorPanel, TickButton, TickSwitch }
})
export default class DashboardChartingTileChartDateSerieEditor extends Vue {
  LanguagePath = LanguagePath
  Appearance = Appearance;
  Color = Color;
  Size = Size;
  @VModel({ required: true }) private model!: Required<ChartDataTileSettingsChartSerieSettings>;

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

  private remove() {
    this.$emit("remove");
    return false;
  }

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }
  private get statId() {
    return this.model?.statId;
  }

  private set statId(to: string) {
    const stat = this.getStatDef(to);
    this.name = stat?.name || "-";
    this.model.statId = to;
    this.model.dataType = stat.dataType;

    if (stat?.dataType == TickStatDataTypeEnum.DurationInMs && this.model.dataValueType == ChartDataValueTypeEnum.Count) {
      this.model.dataValueType = ChartDataValueTypeEnum.Average;
    }


    this.pushUpdate();
  }




  private get name() {
    return this.model?.title;
  }

  private set name(to: string) {
    this.model.title = to;
    this.pushUpdate();
  }

  private get color() {
    return this.model?.color;
  }

  private set color(to: ColorsEnum) {
    this.model.color = to;
    this.pushUpdate();
  }
  private get colorOptions() {
    return getColorOptions()
  }

  private get dataValueType() {
    return this.model?.dataValueType;
  }

  private set dataValueType(to: ChartDataValueTypeEnum) {
    this.model.dataValueType = to;
    this.pushUpdate();
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

  private get chartingType() {
    return this.model?.chartingType;
  }

  private set chartingType(to: ChartingTypeEnum) {
    this.model.chartingType = to;
    this.pushUpdate();
  }
  private get chartingTypeOptions() {
    return getChartingTypeOptions()
  }

  private getStatDef(statId: string) {
    return this.statDefinitions.find(p => p.id == statId);
  }

  private get chosenStatDefinition() {
    return this.getStatDef(this.statId);
  }
  private get statHasDataPerSubject() {
    return this.chosenStatDefinition?.hasStatsPerSubject ?? false;
  }

  private get statSubjectType() {
    return this.chosenStatDefinition?.subjectType ?? TickStatSubjectType.None;
  }

  private get statSubjectTypeName() {
    switch (this.statSubjectType) {
      case TickStatSubjectType.CommunicationChannel:
        return translate(LanguagePath.Channel);
      case TickStatSubjectType.DataAdapterDefinition:
        return translate(LanguagePath.DataAdapter);
      case TickStatSubjectType.SlaDefinition:
        return translate(LanguagePath.SLA);
      case TickStatSubjectType.LabelDefinition:
        return translate(LanguagePath.Label);
      case TickStatSubjectType.User:
        return translate(LanguagePath.User);
      case TickStatSubjectType.TaskDefinition:
        return translate(LanguagePath.TaskDefinition);
      case TickStatSubjectType.Team:
        return translate(LanguagePath.Team);
      case TickStatSubjectType.None:
      default:
        return "";

    }
  }

  private get getSeriePerSubjectIfAvailable() {
    return this.model?.getSeriePerSubjectIfAvailable;
  }

  private set getSeriePerSubjectIfAvailable(to: boolean) {
    this.model.getSeriePerSubjectIfAvailable = to;
    this.pushUpdate();
  }

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
