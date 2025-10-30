<template>
  <div>
    <div class="action">
      <span class="info">{{ keyPadNum }}:</span>
      <TickInput :disabled="disabled" maxlength="30" class="input" v-model="text" :placeholder="$translate(LanguagePath.App_ChannelEditor_LobbyAction_Text)" />
    </div>
    <div class="action-output">
      <span class="info">When chosen:</span>
      <TickSelector :disabled="disabled" v-model="actionItemType" :options="actionTypeOptions" />


      <TickButton v-if="this.actionItemType == PhoneActionItemType.StartFlow" icon="flow" :disabled="disabled" class="flow-button" ref="toggleButton" @click="togglePanel"
        :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">
        {{ this.actionFriendlyName }}
      </TickButton>
      <UsersAndTeamsSelector v-else :disabled="disabled" v-model="transferCallTo" :emptyLabel="$translate(LanguagePath.App_Select)" />

      <TickButton :disabled="disabled" class="delete-button" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular" />
    </div>

  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import FlowsPanel from "@/components/panels/FlowsPanel.vue";
import { getPhoneChannelActionItemType } from "@/helpers/enumsHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { translate } from "@/plugins/translatePlugin";
import useUtilityDataStore from "@/store/utilitydata";
import { AssigneeTypeEnum, LanguagePath, PhoneActionItemData, PhoneActionItemType, PhoneActionTransferCallItemData, TickFlowDefinitionSummary } from "@/TickApi";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../Selectors/UsersAndTeamsSelector.vue";
import ChatWidgetStylePanel from "./ChatWidgetComponents/ChatWidgetStylePanel.vue";

@Component({
  emits: ["update", "delete"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ChatWidgetStylePanel, TickHeading, TickSelector, FlowsPanel, TickDropdown, UsersAndTeamsSelector },
})
export default class PhoneChannelLobbyActionEditor extends Vue {
  PhoneActionItemType = PhoneActionItemType
  AssigneeTypeEnum = AssigneeTypeEnum
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop({ required: true }) private action!: PhoneActionItemData;
  @Prop() private disabled!: boolean;
  @Prop() private keyPadNum!: number;

  private settingsSuccess = false;
  private activePanel = "";

  private remove() {
    this.$emit("delete");
  }

  private get transferCallTo(): UsersAndTeamsSelection {
    return {
      userIds: this.transferCallData?.userId ? [this.transferCallData.userId] : [],
      teamIds: this.transferCallData?.teamId ? [this.transferCallData.teamId] : [],
    };
  }
  private set transferCallTo(to: UsersAndTeamsSelection) {
    this.action.actionType = PhoneActionItemType.TransferCall;

    if (to.userIds.length) {
      this.transferCallData = {
        teamId: null,
        userId: to.userIds.length ? to.userIds[to.userIds.length - 1] : null,
      }
    } else if (to.teamIds.length) {
      this.transferCallData = {
        teamId: to.teamIds.length ? to.teamIds[to.teamIds.length - 1] : null,
        userId: null,
      }
    } else {
      this.transferCallData = {
        teamId: null,
        userId: null,
      }
    }



    this.updateModel();
  }

  private get actionItemType() {
    return this.action.actionType || PhoneActionItemType.StartFlow;
  }

  private set actionItemType(to: PhoneActionItemType) {
    this.action.data = "";
    this.action.actionType = to;
    this.updateModel();
  }

  private get transferCallData(): PhoneActionTransferCallItemData {
    if (this.actionItemType == PhoneActionItemType.TransferCall) {
      try {
        return JSON.parse(this.action.data || "{}") as PhoneActionTransferCallItemData;
      } catch (error) {
        //console.log(error);

        return null;
      }


    } else {
      return null;
    }
  }

  private set transferCallData(to: PhoneActionTransferCallItemData) {
    this.action.data = JSON.stringify(to);
  }

  private get actionTypeOptions() {
    return getPhoneChannelActionItemType();
  }


  private get text() {
    return this.action.text || "";
  }
  private set text(to: string) {
    this.action.text = to;
    this.updateModel();
  }


  private get actionFriendlyName() {
    if (!this.action.data || this.action.actionType != PhoneActionItemType.StartFlow) {
      return translate(LanguagePath.App_Select);
    }

    const flow = useUtilityDataStore().flow(this.action.data) as TickFlowDefinitionSummary;
    return (flow != null) ? flow.name : translate(LanguagePath.Flow);
  }

  private get allFlows() {
    const prodEnvironment = useUtilityDataStore().utilityData.executionEnvironments.find(p => p.isProduction);
    return useUtilityDataStore().utilityData.flowDefinitions.filter(
      (f) => (prodEnvironment == null || f.activeInExecutionEnvironmentIds.some(p => p == prodEnvironment.id))
    );
  }


  private updateModel() {
    this.$emit("update", this.action);
  }

  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openFlowPanel();
    }
  }

  private openFlowPanel() {
    if (this.activePanel) { return; }

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
          this.action.actionType = PhoneActionItemType.StartFlow;
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

.info {
  font-size: $text-size-regular;
  font-style: italic;
}

.action {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  font-size: $text-size-regular;

  .input {
    flex-grow: 1;
  }
}


.action-output {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;

  &:last-child {
    justify-self: end;
  }


}
</style>
