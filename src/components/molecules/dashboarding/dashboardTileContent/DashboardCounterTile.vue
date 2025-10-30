<template>
  <TickCounter class="tile-counter" :size="counterSize" :value="displayValue" :unit="displayUnit" :title="title" :titleTooltip="titleTooltip" :color="color" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { DashboardTileSettings, DatawarehouseCounterDataTileSettings, DashboardTileCounterResponse, TickStatDataTypeEnum, ColorsEnum, LanguagePath } from "@/TickApi";
import { displayDate, getTimespan } from '@/helpers/dateHelper';
import TickCounter, { CounterSize } from '@/components/atoms/TickCounter.vue';
import { numberToString } from '@/helpers/stringHelper';
import { translate } from '@/plugins/translatePlugin';
@Component({
  emits: ["resolve"],
  components: { TickCounter }
})
export default class DashboardCounterTile extends Vue {

  @Prop() private dashboardId: Required<string>;
  @Prop() private definitionData: Required<DashboardTileSettings>;
  @Prop() private contentData: Required<DashboardTileCounterResponse>;

  private get counterSize() {
    const fullheight = this.definitionData.height == null || this.definitionData.height > 3;
    const fullWidth = this.definitionData.width == null || this.definitionData.width > 3;

    if (fullheight && fullWidth) { return CounterSize.XL }
    if (this.definitionData.height > 3 && this.definitionData.width > 3) { return CounterSize.Large }
    if (this.definitionData.height > 1 && this.definitionData.width > 1) { return CounterSize.Regular }

    return CounterSize.Small;
  }

  private get color(): ColorsEnum {
    return this.contentData?.conditionalColor;
  }

  private get title() {
    return this.chartSettings.title;
  }

  private get titleTooltip() {
    return `${this.title} ${translate(LanguagePath.App_Charting_UpdatedTo_Text, [{ path: 'to', value: this.feederUpdatedToText }])}`;
  }


  private get feederUpdatedToText() {
    return this.feederUpdatedTo ? displayDate(this.feederUpdatedTo) : "-";
  }

  private get feederUpdatedTo() {
    return this.contentData?.updatedTo
  }

  private get chartSettings(): DatawarehouseCounterDataTileSettings {
    const json = (this.definitionData ? this.definitionData.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }

  private get tileData(): DashboardTileCounterResponse {
    return this.contentData;

    // const d = 86400000;
    // const hour = 12 * 3600000;
    // return {
    //   id: "test",
    //   value: d + hour,
    // };
  }

  private get timespan() {
    const val = this.tileData;
    return getTimespan(val ? val.value : 0)
  }

  private get displayValue() {
    const v = this.tileData?.value;
    if (this.tileData == null) { return "-"; }

    switch (this.chartSettings.type) {
      case TickStatDataTypeEnum.DurationInMs: return this.timespan.value;
      case TickStatDataTypeEnum.Number:
      default:
        return numberToString(v);
    }

  }

  private get displayUnit() {
    const val = this.tileData;

    if (val == null) { return ""; }

    if (this.chartSettings.type == TickStatDataTypeEnum.DurationInMs) {
      return this.timespan.unit
    } else {
      return "";
    }
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.tile-counter {
  border-radius: 12px;
  overflow: hidden;
}
</style>
