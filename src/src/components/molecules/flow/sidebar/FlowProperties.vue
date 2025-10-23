<template>
  <div class="properties" v-if="flow">
    <div class="flex-row item-actions">
      <input type="text" class="name" v-model="flowName" :disabled="!allowEditFlow" />
      <TickButton icon="delete" :disabled="!allowEditFlow" @click="deleteFlow" :appearance="Appearance.secondary" :color="Color.contrast" />
    </div>
    <div class="flex-row item-actions-secondary ">
      <ExecutionEnvironmentLabel :environmentId="flow.executionEnvironmentId" />
      <span v-if="flowActive" class="active">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Flow_IsActiveFlow) }}</span>
      <span class="actions-counter">{{ this.actionsCounterText }}</span>
    </div>
    <div class="flex-row item-actions-third ">
      <FlowTestButton :flow="flow" />
      <TickDropdown :disabled="!allowEditFlow" :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_Flow_CopyTo_Placeholder)"
        :dropdownTitle="$translate(LanguagePath.App_FlowEditor_SideBar_Flow_CopyTo_PanelTitle)" :noFilter="true" @select="setEnvironment" :options="environmentOptions"
        :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton :disabled="!allowEditFlow" @click="toggleActive" :appearance="Appearance.secondary" :color="Color.contrast">{{ this.activeToggleText }}</TickButton>
    </div>

    <EditorMessage v-if="!flow?.active" :type="EditorMessageType.Message" title="Flow is not active" message="This flow is not active, activate to start using it." />


    <div class="settings">
      <SidebarPanel id="flow-start" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Flow_StartCriteria)">
        <TickSelector :sort="false" v-model="trigger" :options="triggerOptions" :disabled="disabled" />
        <div v-if="isAutomatic">
          <TickHeading :size="Size.small">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Flow_ChannelsSelector_Title) }}</TickHeading>
          <CommunicationChannelsSelector :emptyLabel="$translate(LanguagePath.Channels)" v-model="startOnCommunicationChannelIds" />
        </div>

        <TickHeading :size="Size.xsmall"> {{ $translate(LanguagePath.App_FlowEditor_SideBar_Flow_Conditions_Title) }}</TickHeading>

        <div class="flex-row">
          <TickButton v-if="isAutomatic" @click="setStartCondition" ref="setStartCondition" :appearance="Appearance.secondary" :color="Color.contrast" :size="ButtonSize.mini"> {{
            $translate(LanguagePath.App_FlowEditor_SideBar_Flow_StartConditions_Title) }}</TickButton>
          <TickButton @click="setSkipCondition" ref="setSkipCondition" :appearance="Appearance.secondary" :color="Color.contrast" :size="ButtonSize.mini">{{
            $translate(LanguagePath.App_FlowEditor_SideBar_Flow_SkipConditions_Title) }}</TickButton>
        </div>


        <EditorMessage class="warning" v-if="isAutomatic && !this.hasChannels" :type="EditorMessageType.Warning" title="Select starting channels"
          message="Configure one or more channels for which this flow may start." />
      </SidebarPanel>

      <SidebarPanel v-if="showDefaultButUSerSelector" id="flow-bot" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Flow_DefaultSender_Title)">
        <TickSelector v-model="defaultBotUser" :options="botOptions" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Flow_DefaultSenderSelector_Title) }}
        </TickSelector>
        <EditorMessage class="warning" v-if="showNoBotWarning" :type="EditorMessageType.Warning" title="No Bot to work with"
          message="Select a bot-user to be able to send messages, questions etc to your audience." />
      </SidebarPanel>
    </div>


    <FlowInstanceLogsList :selectedLogId="selectedLogId" @logShowTravel="onLogShowTravel" @logSelect="onLogSelect" :flowDefinitionId="flowDefinitionId"
      :flowDefinitionVersionId="flowDefinitionVersionId" />


    <DocuHolder class="docuHolder" :group="docuBlocks" />

    <TickRtcIndicator />
  </div>
</template>

<script lang="ts">
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton, { Appearance, Size as ButtonSize, Color } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading, { Size } from '@/components/atoms/TickHeading.vue';
import TickRtcIndicator from '@/components/atoms/TickRtcIndicator.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import ConditionEditorPanel from "@/components/molecules/flow/panel/ConditionEditorPanel.vue";
import { focus } from '@/directives';
import { getEmptyConditiongroup } from '@/helpers/conditionHelper';
import { getFlowTriggerEnumOptions } from '@/helpers/enumsHelper';
import { patchFlowMetadata } from "@/helpers/flowhelpers";
import { jsonProxy } from '@/helpers/jsonProxy';
import { mount, unmount } from "@/helpers/mountHelper";
import { onConfirmation } from '@/helpers/questionHelper';
import { translate } from '@/plugins/translatePlugin';
import FlowRtcHub from '@/services/rtc/FlowRtcHub';
import useFlowStore from '@/store/flows';
import useUtilityDataStore from '@/store/utilitydata';
import { ConditionGroup, DocumentationGroup, FlowTriggerEnum, LanguagePath, LogData, TickFlowDefinition, TickFlowDefinitionMetaData, UserTypeEnum } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ChannelLabel from '../../channel/ChannelLabel.vue';
import DocuHolder from '../../docublocks/DocuHolder.vue';
import ExecutionEnvironmentLabel from '../../executionEnvironment/ExecutionEnvironmentLabel.vue';

import CommunicationChannelsSelector from '../../Selectors/CommunicationChannelsSelector.vue';
import { actionSelectionEvent } from '../node/StepNode.vue';
import FlowTestButton from '../panel/FlowTestButton.vue';
import TickCondition from '../panel/TickCondition.vue';
import TickConditionElement from '../panel/TickConditionElement.vue';
import TickConditionGroupEditor from '../panel/TickConditionGroupEditor.vue';
import FlowInstanceLogsList from './FlowInstanceLogsList.vue';

@Component({
  directives: { focus },
  emits: ["patch", "delete", "navigateToFlow", "selectAction"],
  components: {
    TickCheckbox,
    ConditionEditorPanel,
    TickButton,
    ChannelLabel,
    TickSelector,
    TickDropdown,
    TickSwitch,
    EditorMessage,
    TickRtcIndicator,
    DocuHolder,
    ExecutionEnvironmentLabel,
    TickHeading,
    CommunicationChannelsSelector,
    FlowTestButton,
    SidebarPanel, FlowInstanceLogsList
  }
})
export default class FlowProperties extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size;
  ButtonSize = ButtonSize
  EditorMessageType = EditorMessageType;
  DocumentationGroup = DocumentationGroup;
  LanguagePath = LanguagePath
  @Prop() private flow!: TickFlowDefinition;
  @Prop() private disabled!: boolean;
  @Prop() private allowEditFlow!: boolean;
  @Prop() private selectedLogId!: string;

  private onLogShowTravel(log: LogData) {
    this.$emit("logShowTravel", log)
  }

  private onLogSelect(log: LogData) {
    const select: actionSelectionEvent = {
      actionId: log.actionId,
      stepId: log.stepId,
      fitView: true,
    }
    this.$emit("selectAction", select);
  }

  private get flowDefinitionId() {
    return this.flow?.id;
  }

  private get flowDefinitionVersionId() {
    return this.flow?.versionId;
  }

  private get activeToggleText() {
    return this.flow.active ? translate(LanguagePath.App_FlowEditor_Deactivate) : translate(LanguagePath.App_FlowEditor_Activate);
  }

  private get nrOfActions(): number {
    const s = this.flow?.steps;
    if (!s) { return 0; }

    let actionsCounter = 0;
    for (let index = 0; index < this.flow.steps.length; index++) {
      const step = this.flow.steps[index];

      const nrOfStepActions = step.actions?.length;
      if (nrOfStepActions) {
        actionsCounter += nrOfStepActions;
      }

    }

    return actionsCounter;
  }

  private get actionsCounterText(): string {
    const n = this.nrOfActions;
    if (!n) { return translate(LanguagePath.App_FlowEditor_SideBar_Flow_NoActions) }
    else if (n == 1) { return translate(LanguagePath.App_FlowEditor_SideBar_Flow_SingularAction) }
    else { return translate(LanguagePath.App_FlowEditor_SideBar_Flow_SingularAction, [{ path: 'nr', value: n.toString() }]) }
  }

  private get flowName() {
    return this.flow.name;
  }
  private set flowName(to: string) {
    this.patchFlowMetadata({ name: to });
  }

  private get docuBlocks(): DocumentationGroup[] {
    const r: DocumentationGroup[] = []
    r.push(DocumentationGroup.FlowEditorFlow)

    if (this.isInProduction) {
      r.push(DocumentationGroup.FLowEditorFlowInProduction)
    } else {
      r.push(DocumentationGroup.FLowEditorFlowInDevelopment)
    }

    return r;
  }

  private deleteFlow() {
    this.$emit("delete");
  }

  private get isInProduction() {
    if (!this.flow) { return false; }
    const env = useUtilityDataStore().executionEnvironment(this.flow.executionEnvironmentId);
    return (env) ? env.isProduction : false;
  }



  private setEnvironment(to: string) {
    useFlowStore().copyFlowToEnvironment(this.flow.versionId, to).then((flow) => {
      this.$emit("navigateToFlow", { id: flow.id, versionId: flow.versionId });
    });
  }

  private get environmentOptions() {
    const labels = useUtilityDataStore().utilityData.executionEnvironments;
    const availableOptions = labels.filter(p => p.id != this.flow.executionEnvironmentId)


    let options = availableOptions.map((item) => ({
      text: item.name,
      id: item.id,
    }))
    return options;
  }
  private get flowActive(): boolean {
    return this.flow.active;
  }



  private toggleActive() {
    const to = !this.flow.active;

    if (to) {
      onConfirmation(() => {
        FlowRtcHub.setFlowActive({
          flowVersionId: this.flow.versionId,
          active: to,
        });
      }, translate(LanguagePath.App_FlowEditor_StartNode_ToggleActive_Confirmation))
    } else {
      FlowRtcHub.setFlowActive({
        flowVersionId: this.flow.versionId,
        active: to,
      });
    }


  }

  private get hasChannels() {
    const r = this.flow != null
      && this.flow.startOnCommunicationChannelIds != null
      && this.flow.startOnCommunicationChannelIds.length > 0;
    return r;
  }

  // private removeChannel(channelId: string) {

  //   const index = this.flow.startOnCommunicationChannelIds.findIndex(p => p == channelId);
  //   if (index > -1) {

  //     this.flow.startOnCommunicationChannelIds.splice(index, 1);

  //     //fixme: proxy needs to see array changes
  //     this.flow.startOnCommunicationChannelIds = this.flow.startOnCommunicationChannelIds.slice();
  //     this.patchFlowMetadata({ startOnCommunicationChannelIds: this.flow.startOnCommunicationChannelIds.slice() });
  //   }
  // }

  // private addStartOnCommunicationChannelId(to: string) {
  //   if (!this.flow.startOnCommunicationChannelIds) { this.flow.startOnCommunicationChannelIds = []; }
  //   this.flow.startOnCommunicationChannelIds.push(to);
  //   this.flow.startOnCommunicationChannelIds = this.flow.startOnCommunicationChannelIds.slice();
  //   this.patchFlowMetadata({ startOnCommunicationChannelIds: this.flow.startOnCommunicationChannelIds.slice() });
  // }

  private get startOnCommunicationChannelIds() {
    return this.flow?.startOnCommunicationChannelIds || []
  }

  private set startOnCommunicationChannelIds(to: string[]) {
    this.flow.startOnCommunicationChannelIds = to;
  }

  private get isAutomatic() {
    return this.flow.trigger == FlowTriggerEnum.Auto;
  }

  private set isAutomatic(to: boolean) {
    const newValue = to ? FlowTriggerEnum.Auto : FlowTriggerEnum.Manual;
    this.patchFlowMetadata({ trigger: newValue });
  }


  private get trigger() {
    return this.flow.trigger;
  }

  private set trigger(to: FlowTriggerEnum) {
    this.patchFlowMetadata({ trigger: to });
  }

  private get triggerOptions() {
    return getFlowTriggerEnumOptions();
  }


  private get showNoBotWarning() {
    return !this.defaultBotUser;
  }

  private get showDefaultButUSerSelector() {
    return true;
    //return !this.defaultBotUser;

  }

  private set defaultBotUser(botUserId: string) {
    this.patchFlowMetadata({ defaultBotUserId: botUserId })
  }
  private get defaultBotUser(): string {
    return this.flow.defaultBotUserId;
  }

  private get botOptions() {
    const labels = useUtilityDataStore().utilityData.users.filter(p => p.userType == UserTypeEnum.Bot && !p.deleted);
    let options = labels.map((item) => ({
      text: item.name,
      value: item.id,
    }))
    return options;
  }

  private ensureIsCondition(condition?: ConditionGroup) {
    if (!condition) {
      condition = getEmptyConditiongroup()
    }
    return condition;
  }

  private setStartCondition() {
    this.ensureIsCondition(this.startCondition);
    this.togglePanelFor("setStartCondition", this.startCondition);
  }

  private setSkipCondition() {
    this.ensureIsCondition(this.skipCondition);
    this.togglePanelFor("setSkipCondition", this.skipCondition);
  }

  private patchFlowMetadata(delta: Partial<TickFlowDefinitionMetaData>) {
    patchFlowMetadata(this.flow, delta);
  }

  private activePanel = {
    group: "",
    panelId: "",
    conditionId: "",
  }

  private togglePanelFor(fromRef: string, condition: ConditionGroup) {
    const isCurrentActivePanel = (this.activePanel.group === fromRef && this.activePanel.conditionId === condition.id);
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.conditionId = condition.id;
    this.activePanel.panelId = this.openPanel(fromRef, { condition: condition, disabled: this.disabled });
  }

  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";
    this.activePanel.conditionId = "";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>) {
    return mount(ConditionEditorPanel, {
      props: {
        ...props,
      },
      events: {
        close: () => { this.closeActivePanel(); },
        exit: (conditionGroup: ConditionGroup) => {
          this.patchConditionGroup(conditionGroup);
          this.closeActivePanel();
        },
      },
      loadComponents: [TickConditionElement, TickCondition, TickConditionGroupEditor]
    }
    );
  }

  private get startCondition() {
    return jsonProxy<ConditionGroup>(this.flow.startConditionsJson || "{}", (json) => {
      this.flow.startConditionsJson = json;

    });
  }

  private get skipCondition() {
    return jsonProxy<ConditionGroup>(this.flow.skipConditionsJson || "{}", (json) => {
      this.flow.skipConditionsJson = json;
    });
  }

  private patchConditionGroup(condition: ConditionGroup) {
    if (this.startCondition.id == condition.id) {
      this.patchFlowMetadata({ startConditionsJson: JSON.stringify(condition) });
    }
    if (this.skipCondition.id == condition.id) {
      this.patchFlowMetadata({ skipConditionsJson: JSON.stringify(condition) });
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.properties {

  //font-size: $text-size-regular;
  .flex-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: baseline;
  }

  .item-actions {

    .name {
      flex-grow: 1;
      cursor: text;
      font-size: 25px;
      display: inline-flex;
      @include font-outfit;
      font-weight: 600;
      width: 60%;


    }
  }

  .item-actions-secondary {
    margin-bottom: 20px;

    .active {
      color: $success;
      font-size: 0.8em;
    }

  }



  .warning {
    margin-bottom: 20px;
  }

  .settings {
    margin-top: 50px;
    display: grid;
    gap: 5px;

  }

}


.docuHolder {
  height: auto;
  margin-top: 100px;
}

.actions-counter {
  font-size: $text-size-regular;
  opacity: 0.8;
}
</style>
