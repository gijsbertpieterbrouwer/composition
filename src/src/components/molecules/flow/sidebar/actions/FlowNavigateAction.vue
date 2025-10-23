<template>
  <div class="action">

    <SidebarPanel id="subflow-general" :name="$translate(LanguagePath.App_FlowEditor_SideBar_FlowNavigate_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_FlowNavigate_Explanation) }}

      </template>

      <TickSelector v-model="selectedFlow" :disabled="disabled" :options="flowOptions" />

      <!-- <TickButton class="flow-button" ref="toggleButton" @click="togglePanel" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">Start flow: {{ this.flowName }}
      </TickButton> -->
    </SidebarPanel>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickIcon from "@/components/TickIcon.vue";
import { FlowDefinitionAction, LanguagePath, NavToSubflowSettings, TickFlowDefinitionSummary, } from "@/TickApi";
import { FlowNavigationFlowLogicActionSettings } from "@/TickApiModels";
import { jsonProxy } from "@/helpers/jsonProxy";
import TickButton from '@/components/atoms/TickButton.vue';
import useFlowStore from '@/store/flows';
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import useUtilityDataStore from '@/store/utilitydata';
import TickSelector from '@/components/atoms/TickSelector.vue';
@Component({
  emits: ["remove", "update"],
  components: { SidebarPanel, TickIcon, TickButton, TickSelector },
})
export default class FlowNavigateAction extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowNavigationFlowLogicActionSettings;
  @Prop() private disabled!: boolean;

  private get data() {
    return jsonProxy<NavToSubflowSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get selectedFlow() {
    return this.data.targetFlowDefinitionId;
  }

  private set selectedFlow(input: string) {
    this.data.targetFlowDefinitionId = input;
  }

  private get flowOptions() {
    const flows = this.allFlows([useFlowStore().activeFlowId], false);

    let options = flows.map((flow) => ({
      text: flow.name,
      value: flow.id,
    }))

    return options;
  }


  private allFlows(disableIds: [string], allowNonProduction: boolean): TickFlowDefinitionSummary[] {
    const prodEnvironment = useUtilityDataStore().utilityData.executionEnvironments.find(p => p.isProduction);
    const flows = useUtilityDataStore().utilityData.flowDefinitions.filter(
      (f) => (!disableIds || !disableIds.some(p => p == f.id))
        && (prodEnvironment == null || allowNonProduction || f.activeInExecutionEnvironmentIds.some(p => p == prodEnvironment.id))
    );

    return flows;

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
