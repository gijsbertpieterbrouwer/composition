<template>
  <div class="action">
    <TickInput maxlength="30" class="input" v-model="text" :placeholder="$translate(LanguagePath.App_ChannelEditor_LobbyAction_Text)" />

    <div class="buttons">
      <TickButton class="flow-button" ref="toggleButton" @click="togglePanel" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">
        {{ $translate(LanguagePath.App_ChannelEditor_LobbyAction_StartFlow, [{ path: 'name', value: this.flowName }]) }}
      </TickButton>
      <TickButton class="delete-button" @click="remove" :appearance="Appearance.secondary" icon="delete" :color="Color.contrast" :size="Size.regular" />
    </div>
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import FlowsPanel from "@/components/panels/FlowsPanel.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { translate } from "@/plugins/translatePlugin";
import useUtilityDataStore from "@/store/utilitydata";
import { ChatWidgetActionItemData, ChatWidgetActionItemType, LanguagePath, TickFlowDefinitionSummary, } from "@/TickApi";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import ChatWidgetStylePanel from "./ChatWidgetComponents/ChatWidgetStylePanel.vue";

@Component({
  emits: ["update", "delete"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ChatWidgetStylePanel, TickHeading, TickSelector, FlowsPanel },
})
export default class ChatWidgetChannelLobbyActionEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop({ required: true }) private action!: ChatWidgetActionItemData;
  @Prop() private disabled!: boolean;

  private settingsSuccess = false;
  private activePanel = "";

  private remove() {
    this.$emit("delete");
  }


  private get text() {
    return this.action.text || "";
  }
  private set text(to: string) {
    this.action.text = to;
    this.updateModel();
  }


  private get flowName() {
    if (!this.action.data || this.action.actionType != ChatWidgetActionItemType.StartFlow) {
      return "";
    }

    const flow = useUtilityDataStore().flow(this.action.data) as TickFlowDefinitionSummary;
    return (flow != null) ? flow.name : translate(LanguagePath.Flow);
  }

  // private get flowOptions() {
  //   const flows = this.allFlows;
  //   let options = flows.map((adapter) => ({
  //     text: adapter.name,
  //     value: adapter.id,
  //   }))
  //   return options;
  // }

  private get allFlows() {
    const prodEnvironment = useUtilityDataStore().utilityData.executionEnvironments.find(p => p.isProduction);
    return useUtilityDataStore().utilityData.flowDefinitions.filter(
      (f) => (prodEnvironment == null || f.activeInExecutionEnvironmentIds.some(p => p == prodEnvironment.id))
    );
  }

  // private get selectedFlow() {
  //   return this.action.data;
  // }
  // private set selectedFlow(input: string) {
  //   this.action.data = input;
  //   this.updateModel();
  // }

  private updateModel() {
    this.$emit("update", this.action);
  }

  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) {
      return;
    }

    const panelOptions: TickPanelOptions = {
      title: "FlowsPanel",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(FlowsPanel, {
      props: {
        allowNonProduction: false,
        panelOptions: panelOptions,
        modelValue: computed(() => this.action.data),
      },
      events: {
        close: () => {
          this.closePanel();
        },
        "update:modelValue": (to: string) => {
          this.action.actionType = ChatWidgetActionItemType.StartFlow;
          this.action.data = to;

          this.updateModel();
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }
    unmount(this.activePanel);
    this.activePanel = "";
  }

}


</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.action {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;

  .input {
    width: 200px;
  }

  .buttons {

    .flow-button,
    .delete-button {
      margin-right: 5px;
      display: inline-block;
    }


  }

}
</style>
