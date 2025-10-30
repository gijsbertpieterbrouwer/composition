<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_SLAEditor_SuccessSettings_Title)">
    <template v-slot:explainer>
      {{ $translate(LanguagePath.App_SLAEditor_IRTSuccessSettings_Explanation) }}
    </template>

    <div class="flex-row">
      {{ $translate(LanguagePath.App_SLAEditor_IRTSuccessSettings_Prefix) }}
      <TickInput class="periodNumber" v-model="ticketResponseTimeMaxPeriodCount" type="number" />
      <TickSelector v-model="ticketResponseTimeDuePeriod" :options="periodOptions" />
      {{ $translate(LanguagePath.App_SLAEditor_IRTSuccessSettings_Suffix) }}
    </div>

    <TickCheckbox v-model="ticketResponseTimeUseCountdown">Show the countdown in ticket list</TickCheckbox>
    <div class="flex-row" v-if="ticketResponseTimeUseCountdown">
      {{ $translate(LanguagePath.App_SLAEditor_IRTCountDownSettings_Prefix) }}
      <TickInput class="periodNumber" v-model="ticketResponseTimeCountdownPeriodCount" type="number" />
      <TickSelector v-model="ticketResponseTimeCountdownPeriod" :options="periodOptions" />
      {{ $translate(LanguagePath.App_SLAEditor_IRTCountDownSettings_Suffix) }}
    </div>
  </TickEditorPanel>
</template>



<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import { getSlaPeriodTypeOptions } from "@/helpers/enumsHelper";
import { jsonProxy } from "@/helpers/jsonProxy";
import { LanguagePath, SlaPeriod, SLATicketResponseTimeSettings } from "@/TickApi";
import { Component, VModel, Vue } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";

// interface Stat {
//   name: string;
//   tooltipName: any;
//   min: number;
//   max: number;
//   avg: number;
// }

@Component({
  emits: ["updated"],
  components: {
    TickInput,
    TickCheckbox,
    ThenHr,
    TickScreen,
    TickEditorPanel,
    TickDropdown,
    TickSelector,
    TickHeading,
  },
})
export default class SlaDefinitionResponseTimeEditor extends Vue {
  LanguagePath = LanguagePath
  // @Prop() private slaSettingsJson!: string;
  @VModel({ required: true }) private data!: string;

  private get ticketResponseTimeDuePeriod() {
    return this.ticketResponseTimeSettings.duePeriod;
  }
  private set ticketResponseTimeDuePeriod(to: SlaPeriod) {
    this.ticketResponseTimeSettings.duePeriod = to;
  }

  private get ticketResponseTimeMaxPeriodCount() {
    return this.ticketResponseTimeSettings.maxPeriodCount;
  }
  private set ticketResponseTimeMaxPeriodCount(to: number) {
    this.ticketResponseTimeSettings.maxPeriodCount = to;
  }

  private get ticketResponseTimeUseCountdown() {
    return this.ticketResponseTimeSettings.useCountdownBeforeDue;
  }
  private set ticketResponseTimeUseCountdown(to: boolean) {
    this.ticketResponseTimeSettings.useCountdownBeforeDue = to;
  }

  private get ticketResponseTimeCountdownPeriodCount() {
    return this.ticketResponseTimeSettings.countdownBeforeDuePeriodCount;
  }
  private set ticketResponseTimeCountdownPeriodCount(to: number) {
    this.ticketResponseTimeSettings.countdownBeforeDuePeriodCount = to;
  }

  private get ticketResponseTimeCountdownPeriod() {
    return this.ticketResponseTimeSettings.countdownBeforeDuePeriod;
  }
  private set ticketResponseTimeCountdownPeriod(to: SlaPeriod) {
    this.ticketResponseTimeSettings.countdownBeforeDuePeriod = to;
  }


  private get periodOptions() {
    return getSlaPeriodTypeOptions();
  }

  private get ticketResponseTimeSettings() {
    return jsonProxy<SLATicketResponseTimeSettings>(
      this.data || "{}",
      (json) => {
        this.data = json;
      }
    );
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.explainer {
  font-size: $text-size-regular;
  font-style: italic;

  &.success {
    color: $success;
  }
}


.flex-row {
  display: flex;
  gap: 5px;

  align-content: center;
  align-self: center;
  align-items: center;

  .periodNumber {
    width: 60px;
  }
}
</style>
