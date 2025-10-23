<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_SLAEditor_SuccessSettings_Title)">
    <template v-slot:explainer>
      {{ $translate(LanguagePath.App_SLAEditor_MOMSuccessSettings_Explanation) }}
    </template>


    <div class="flex-row">
      {{ $translate(LanguagePath.App_SLAEditor_MOMSuccessSettings_Prefix) }}

      <TickInput v-model="maxOutboundMessagesCount" type="number" :disabled=this.disabled />
      {{ $translate(LanguagePath.App_SLAEditor_MOMSuccessSettings_Suffix) }}
    </div>

  </TickEditorPanel>
</template>


<script lang="ts">
import LabelList from "@/components/atoms/LabelList.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { LanguagePath, SLATicketMessageSettings, } from "@/TickApi";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";

import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import { jsonProxy } from "@/helpers/jsonProxy";

import TickHeading from "@/components/atoms/TickHeading.vue";

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
    LabelList,
    TickDropdown,
    TickSelector,
    TickHeading,
  },
})
export default class SlaDefinitionMessageCountEditor extends Vue {
  LanguagePath = LanguagePath
  // @Prop() private slaSettingsJson!: string;
  @VModel({ required: true }) private data!: string;
  @Prop({ required: false }) private disabled!: boolean;

  private get maxOutboundMessagesCount() {
    return this.settings.maxOutboundMessagesCount;
  }
  private set maxOutboundMessagesCount(to: number) {
    this.settings.maxOutboundMessagesCount = to;
  }

  private get settings() {
    return jsonProxy<SLATicketMessageSettings>(
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

}
</style>
