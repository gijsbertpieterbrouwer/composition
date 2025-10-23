<template>
  <div class="step-node"
    :class="[{ 'disabled': this.disabled, 'selected': this.isSelected, 'noColorSelected': !this.colorSelected, 'no-start-connection': this.missesStartConnection, 'active-log': this.hasStepLogData, 'active-log-no-action': this.hasNoStepLogData }, this.colorName]"
    @contextmenu.prevent="showFlowStepContextMenu($event)">
    <div class="header" :class="[this.colorName, this.openClass]">
      <Handle class="handle off" :id="handleId" type="target" position="left" />

      <div class="title" @click="selectStep">
        <TickIcon name="warning" v-if="missesStartConnection" /> {{ this.stepHeaderTitle }}
      </div>
      <!-- <div class="can-hide">
        <TickDropdown class="add-action-dropdown " icon="" placeholder="Add action" @select="addAction" :options="actionOptions" :appearance="Appearance.secondary" :color="Color.contrast"
          :size="Size.mini" :asButton="true" :round="true" />
      </div> -->
      <CommentButton class="comment can-hide" :class="{ 'force-visible': this.comments.length }" @add="addComment" @resolve="resolveComments" :comments="comments" :showBorder="false" />
    </div>

    <div class="node-content" v-if="!showCollapsed">
      <EditorMessage class="editormessage" v-if="missesStartConnection" :type="EditorMessageType.Message" title="Connection needed"
        message="Connect another step to this one to enable it. Just drag a connector to the connector of this step" />

      <div class="actions" :data-stepId="stepId" v-if="!showCollapsed">
        <VueDraggable :disabled="disabled" group="actionsList" animation="150" easing="cubic-bezier(1, 0, 0, 1)" v-model="actions" item-key="id" :component-data="{ name: 'fade' }" ghost-class="ghost"
          handle=".action-handle" drag-class="drag" @end="onEndDrag">
          <template #item="{ element }">

            <component class="action" :selected="actionIsSelected(element)" @addComment="addActionComment" @resolveComments="resolveActionComments" :data-actionId="actionId(element)"
              :class="{ selected: this.actionIsSelected(element) }" @click="onSelectAction(element)" :is="getActionComponent(element)" :action="element" :settings="actionSettings(element)"
              :isLastAction="isLastAction(element)" :allowConnections="allowConnections(element)" :stepId="step.id" :selectAction="onSelectAction" :selectedLog="selectedLog"
              :warnings="actionWarnings(element)" />

          </template>
        </VueDraggable>

        <!-- <component class="action action-handle" @addComment="addActionComment" @resolveComments="resolveActionComments" :data-actionId="actionId(element)"
              :class="{ selected: this.actionIsSelected(element) }" @click="onSelectAction(element)" :is="getActionComponent(element)" :action="element"
              :settings="actionSettings(element)" :isLastAction="isLastAction(element)" :allowConnections="allowConnections(element)" :stepId="step.id"
              :selectAction="onSelectAction" /> -->


        <div v-if="!hasActions" class="no-actions">
          <template v-if="isFinish">
            <div class="title"> {{ $translate(LanguagePath.App_FlowEditor_StepNode_NoActions_NoTargetStep_Title) }}</div>
            <div class="message">{{ $translate(LanguagePath.App_FlowEditor_StepNode_NoActions_NoTargetStep_Explanation) }} <br />
              <br />{{ $translate(LanguagePath.App_FlowEditor_StepNode_NoActions_NoTargetStep_CallToAction) }}
            </div>
          </template>
          <template v-else>
            <div class="title">{{ $translate(LanguagePath.App_FlowEditor_StepNode_NoActions_Title) }}</div>
            <div class="message"> {{ $translate(LanguagePath.App_FlowEditor_StepNode_NoActions_Explanation) }}</div>
          </template>
        </div>
      </div>

    </div>

    <TickHandle class="target-handle" :id="nextStepTargetHandleId" :isConnected="stepFinishIsConnected" />

    <div class="outside-footer">
      <TickButton @click="toggleOpen" class="opener" :title="$translate(LanguagePath.App_FlowEditor_StepNode_ToggleSize)" :icon="openerIcon" :appearance="Appearance.primary" :color="Color.contrast"
        :round="true" :class="openClass" />

      <TickButton :disabled="disabled" @click="showFlowStepContextMenu($event)" :title="$translate(LanguagePath.App_FlowEditor_StepNode_AddAction)" :icon="'plus'" :appearance="Appearance.primary"
        :color="Color.contrast" :round="true" :class="openClass" />
    </div>

  </div>
</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { Handle, Position } from '@vue-flow/core';
import { Component, Prop, Vue } from "vue-facing-decorator";
import * as VueDraggable from "vuedraggable";

import DataAdapterAction from "@/components/molecules/flow/node/actions/DataAdapterAction.vue";
import MessageAction from "@/components/molecules/flow/node/actions/MessageAction.vue";
import MessageChoiceAction from "@/components/molecules/flow/node/actions/MessageChoiceAction.vue";
import TicketLabelsLogicAction from "@/components/molecules/flow/node/actions/TicketLabelsLogicAction.vue";
import TicketLogicAction from "@/components/molecules/flow/node/actions/TicketLogicAction.vue";
import {
  actionCreationOption, getActionOptions, getConnectionHandleId,
  getStepConnectionHandleId,
} from "@/helpers/flowhelpers";
import {
  BotActionTypeEnum,
  ColorsEnum,
  CommunicationType,
  CommunicatorActionTypeEnum,
  FlowActionType,
  FlowActionTypeEnum,
  FlowComment,
  FlowDefinitionAction, FlowStep,
  FlowTriggerEnum,
  LanguagePath,
  NavigateActionTypeEnum,
  SpecialActionTypeEnum,
  TicketLogicActionTypeEnum,
  TickFlowInstanceLog
} from "@/TickApi";
import { getReadonlyActionSettings } from "@/TickApiModels";

import ConditionalNavigateAction from "@/components/molecules/flow/node/actions/ConditionalNavigateAction.vue";
import DatabagCalculationAction from "@/components/molecules/flow/node/actions/DatabagCalculationAction.vue";
import FlowNavigateAction from "@/components/molecules/flow/node/actions/FlowNavigateAction.vue";
import TicketAssignmentsAction from "@/components/molecules/flow/node/actions/TicketAssignmentsAction.vue";

import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import { openContextDropdownPanel } from "@/components/panels/contextPanels/ContextDropdownPanel.vue";
import { getColorName } from "@/helpers/colorsHelper";
import { translate } from "@/plugins/translatePlugin";
import useFlowStore from "@/store/flows";
import useUtilityDataStore from "@/store/utilitydata";
import useViewstateStore, { InterfaceStateType } from "@/store/viewstate";
import EditorMessage, { EditorMessageType } from "../../EditorMessage.vue";
import AddTaskAction from "./actions/AddTaskAction.vue";
import CommunicatorLogicAction from "./actions/CommunicatorLogicAction.vue";
import MessageQuestionAction from "./actions/MessageQuestionAction.vue";
import MessageSearchKnowledgeBaseAction from "./actions/MessageSearchKnowledgeBaseAction.vue";
import NoteAction from "./actions/NoteAction.vue";
import TicketTitleLogicAction from "./actions/TicketTitleLogicAction.vue";
import TransferCallAction from "./actions/TransferCallAction.vue";
import CommentButton from "./CommentButton.vue";
import TickHandle from "./TickHandle.vue";

export interface stepIndexChange {
  stepId: string;
  newStepId: string;
  actionId: string;
  oldIndex: number;
  newIndex: number;
}

export interface actionSelectionEvent {
  stepId: string;
  actionId: string;
  fitView: boolean;
}

export interface FlowStepEditorMessage {
  actionId?: string;
  message: string;
  title: string;
  type: EditorMessageType;
}

export interface stepNodeData {
  step: FlowStep;
  hasStartConnection: boolean;
  warnings: FlowStepEditorMessage[];
}



@Component({
  emits: ["stepActionIndexChange", "selectAction", "selectStep", "addStepAction", "addComment", "addActionComment", "resolveComments", "resolveActionComments"],
  components: {
    VueDraggable,
    Handle,
    ThenHr,
    Position,
    TickHandle,
    MessageAction,
    MessageChoiceAction,
    MessageQuestionAction,
    MessageSearchKnowledgeBaseAction,
    NoteAction,
    DataAdapterAction,
    TicketLogicAction,
    TicketLabelsLogicAction,
    TicketTitleLogicAction,
    TicketAssignmentsAction,
    FlowNavigateAction,
    ConditionalNavigateAction,
    TickIcon,
    TickDropdown,
    AddTaskAction,
    EditorMessage,
    TickButton,
    CommentButton,
    DatabagCalculationAction,
    TransferCallAction,
    CommunicatorLogicAction
  },
})
export default class StepNode extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size;
  LanguagePath = LanguagePath;
  Position = Position;
  EditorMessageType = EditorMessageType;
  @Prop() private id!: string;
  //@Prop({ default: false }) private selected!: boolean;
  @Prop({ default: "" }) private selectedActionId!: string;
  @Prop({ default: "" }) private selectedStepId!: string;
  @Prop() private data!: stepNodeData;
  @Prop() private disabled!: boolean;
  @Prop() private selectedLog: TickFlowInstanceLog;

  private dragging = false;
  private enabled = true; // dragging

  private actionWarnings(el: FlowDefinitionAction): FlowStepEditorMessage[] {
    const actionsWarnings = this.data.warnings.filter(p => p.actionId == el.id) || [];
    return actionsWarnings;
  }

  private get hasNoStepLogData() {
    return this.selectedLog != null && !this.hasStepLogData;
  }

  private get hasStepLogData() {
    return this.stepLogData?.length > 0;
  }

  private get stepLogData() {
    return this.selectedLog?.travelData?.breadCrumbs?.filter(p => p.targetStepId == this.id);
  }


  private selectStep() {
    this.$emit("selectStep", this.id);
  }

  private get stepHeaderTitle() {
    return this.showCollapsed ?
      `${this.step.name} (${this.actionCount})`
      : this.step.name;
  }


  private get actionCount() {
    return this.step.actions?.length || 0;
  }

  private get openerIcon() {
    return "chevron-down";
  }

  private get openClass() {
    return !this.showCollapsed ? "open" : "closed";
  }

  private get showCollapsed() {
    return useViewstateStore().has(InterfaceStateType.FlowStepCollapsed, this.id);
  }

  private toggleOpen() {
    useViewstateStore().toggle(InterfaceStateType.FlowStepCollapsed, this.id);
  }

  private showFlowStepContextMenu(e: MouseEvent) {
    if (this.disabled) { return; }
    const options = this.actionOptions;

    for (let index = 0; index < options.length; index++) {
      const o = options[index];
      o.icon = o.icon || "plus";
      o.onSelect = () => {
        this.addAction(o.id as string);
      }
    }

    openContextDropdownPanel(e, options, translate(LanguagePath.App_FlowEditor_StepNode_ContextMenu_Title));
    e.stopPropagation();
  }

  private get isSelected() {
    return this.id == this.selectedStepId
  }

  private get hasActions() {
    return this.actions && this.actions.length > 0;
  }
  private get stepId() {
    return this.step.id;
  }
  private get step() {
    return this.data.step;
  }

  private get colorSelected() {
    return this.colorName ? true : false;
  }

  private get colorName() {
    return this.step.color && (this.step.color as ColorsEnum != ColorsEnum.Grey) ? getColorName(this.step.color) : null;
  }

  private actionId(action: FlowDefinitionAction) {
    return action.id;
  }
  private actionIsSelected(action: FlowDefinitionAction) {
    return action.id == this.selectedActionId;
  }

  private get missesStartConnection() {
    return !this.data.hasStartConnection;
  }

  private get comments() {
    return this.step.comments || [];
  }

  private addComment(to: FlowComment) {
    this.$emit("addComment", this.step.id, to);
  }
  private addActionComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addActionComment", stepId, actionId, comment);
  }
  private resolveComments() {

    this.$emit("resolveComments", this.step.id);
  }
  private resolveActionComments(actionId: string) {
    this.$emit("resolveActionComments", this.step.id, actionId);
  }

  private get stepFinishIsConnected() {
    return this.step.targetStepId && this.step.targetStepId != "";
  }

  private get isFinish() {
    const hasActions =
      this.data.step.actions != null && this.data.step.actions.length > 0;

    return !hasActions && !this.data.step.targetStepId;
  }

  private onSelectAction(action: FlowDefinitionAction) {
    const e: actionSelectionEvent = {
      actionId: action.id,
      stepId: this.step.id,
      fitView: false,
    };

    this.$emit("selectAction", e);
  }

  private isLastAction(action: FlowDefinitionAction) {
    var actionIndex = this.step.actions.indexOf(action);
    const isLastAction = actionIndex === this.step.actions.length - 1;
    return isLastAction;
  }

  private allowConnections(action: FlowDefinitionAction) {
    var actionIndex = this.step.actions.indexOf(action);
    const isLastAction = actionIndex === this.step.actions.length - 1;
    var allowsHandle = this.actionAllowsSpecialHandle(action);

    return isLastAction || allowsHandle;
  }

  private get nextStepTargetHandleId() {
    return getStepConnectionHandleId(this.step.id);
  }

  private get handleId() {
    return getConnectionHandleId(this.step.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onEndDrag(e: any) {

    var targetStepId = e.to.closest(".actions").dataset.stepid;
    var fromStepId = e.from.closest(".actions").dataset.stepid;
    var actionId = e.item.dataset.actionid;

    if (e.from == e.to && e.oldIndex == e.newIndex) {
      return;
    } // drag/drop to same place

    const changeData: stepIndexChange = {
      stepId: fromStepId,

      newStepId: targetStepId,

      oldIndex: e.oldIndex, // old index in old step
      newIndex: e.newIndex, // new index in new step

      actionId: actionId,
    };

    this.$emit("stepActionIndexChange", changeData);
  }

  private get actions() {
    return this.step.actions.sort((a, b) => a.index - b.index);
  }

  private actionSettings(action: FlowDefinitionAction) {
    return getReadonlyActionSettings(
      action.actionType,
      action.actionSettingsJson
    );
  }

  private actionAllowsSpecialHandle(action: FlowDefinitionAction) {
    switch (action.actionType) {
      case FlowActionType.TicketLogic:
      case FlowActionType.FlowLogic:
      case FlowActionType.Communicator:
        return false;
      case FlowActionType.BOT:
      case FlowActionType.Navigate:
      case FlowActionType.DataAdapter:
      case FlowActionType.Task:
      case FlowActionType.Special:
        return true;
    }
  }

  private actionIsOfType(action: FlowDefinitionAction, type: number) {
    const settings = getReadonlyActionSettings(
      action.actionType,
      action.actionSettingsJson
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (settings as any).actionType === type;
  }

  // private get addAction() {
  //   return "" as never;
  // }

  private addAction(typeJson: string) {
    var request: actionCreationOption = JSON.parse(typeJson);
    this.$emit("addStepAction", request);
  }

  private get actionOptions() {
    const flow = useFlowStore().activeFlow;
    const channelIds = flow.startOnCommunicationChannelIds || [];
    const channels = useUtilityDataStore().utilityData.communicationChannels.filter(p => channelIds.some(a => a == p.id));

    const hasPossiblePhoneChannel = flow.trigger == FlowTriggerEnum.Manual || channels.some(p => p.communicationType == CommunicationType.Phone);


    return getActionOptions(this.step.id, hasPossiblePhoneChannel);
  }

  private actionIsNotOfType(action: FlowDefinitionAction, type: number) {
    const settings = getReadonlyActionSettings(
      action.actionType,
      action.actionSettingsJson
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (settings as any).actionType !== type;
  }

  private getActionComponent(action: FlowDefinitionAction) {
    if (
      action.actionType === FlowActionType.BOT &&
      this.actionIsOfType(action, BotActionTypeEnum.Message)
    ) {
      return "MessageAction";
    }

    if (
      action.actionType === FlowActionType.BOT &&
      this.actionIsOfType(action, BotActionTypeEnum.TextualQuestion)
    ) {
      return "MessageQuestionAction";
    }
    if (action.actionType === FlowActionType.BOT && this.actionIsOfType(action, BotActionTypeEnum.Choice)) {
      return "MessageChoiceAction";
    }
    if (action.actionType === FlowActionType.BOT && this.actionIsOfType(action, BotActionTypeEnum.SearchKnowledgeBase)) {
      return "MessageSearchKnowledgeBaseAction";
    }

    if (
      action.actionType === FlowActionType.BOT &&
      this.actionIsOfType(action, BotActionTypeEnum.InternalNote)
    ) {
      return "NoteAction";
    }
    if (action.actionType === FlowActionType.DataAdapter) {
      return "DataAdapterAction";
    }
    if (
      action.actionType === FlowActionType.TicketLogic &&
      this.actionIsOfType(action, TicketLogicActionTypeEnum.Ticket)
    ) {
      return "TicketLogicAction";
    }
    if (
      action.actionType === FlowActionType.TicketLogic &&
      this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketLabels)
    ) {
      return "TicketLabelsLogicAction";
    }
    if (
      action.actionType === FlowActionType.TicketLogic &&
      this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketTitle)
    ) {
      return "TicketTitleLogicAction";
    }
    // if (
    //   action.actionType === FlowActionType.TicketLogic &&
    //   this.actionIsOfType(action, TicketLogicActionTypeEnum.QuestTeamAssignments)
    // ) {
    //   return "QuestTeamAssignmentsAction";
    // }
    if (
      action.actionType === FlowActionType.TicketLogic &&
      this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketAssignments)
    ) {
      return "TicketAssignmentsAction";
    }

    if (
      action.actionType === FlowActionType.FlowLogic &&
      this.actionIsOfType(action, FlowActionTypeEnum.FlowNavigation)
    ) {
      return "FlowNavigateAction";
    }

    if (
      action.actionType === FlowActionType.Navigate &&
      this.actionIsOfType(action, NavigateActionTypeEnum.Conditional)
    ) {
      return "ConditionalNavigateAction";
    }

    if (action.actionType === FlowActionType.Task) {
      return "AddTaskAction";
    }

    if (action.actionType === FlowActionType.DatabagLogic) {
      return "DatabagCalculationAction";
    }

    if (
      action.actionType === FlowActionType.Special &&
      this.actionIsOfType(action, SpecialActionTypeEnum.TransferCall)
    ) {
      return "TransferCallAction";
    }

    if (
      action.actionType === FlowActionType.Communicator &&
      this.actionIsOfType(action, CommunicatorActionTypeEnum.CommunicatorLogic)
    ) {
      return "CommunicatorLogicAction";
    }

    return "div";
  }
}
</script>

<style lang="scss">
.then-hr,
.finally-hr {
  margin-left: 12px !important;
}
</style>

<style lang="scss" scoped>
@import "@/styles/theme";

$min-stepwidth: 280px;

.action-handle,
.action-handle * {
  cursor: move;
}

.editormessage {
  background-color: var(--c-flow-node);
  color: $white;
  border-color: $white;
  margin-bottom: 10px;

}

.step-node {

  // padding: 2px;
  border-radius: 14px;
  // overflow: hidden; ==> nO OVERFLOW HIDDEN BECAUSE OF HANDLES STICKING OUT
  background-color: var(--c-flow-node);
  color: var(--c-base);
  @include neon-bg;

  outline-width: 2px;
  outline-style: solid;
  outline-color: transparent;

  &:not(.selected) {
    .header {
      .can-hide:not(.force-visible) {
        visibility: hidden;
      }
    }
  }


  &:hover {
    .header {
      .can-hide {
        visibility: visible !important;
      }
    }

    .outside-footer {
      visibility: visible;
    }
  }



  // &.selected {
  //   z-index: 10000;
  // }

  &:hover,
  &.selected {
    outline-color: var(--c-contrast);
    background-color: var(--c-flow-node-selected);
  }

  &.active-log {
    box-shadow: $brand2 0 0 5px 5px;
  }

  &.active-log-no-action {
    opacity: 0.4;
  }

  .node-content {
    padding: 6px;
    display: flex;
    flex-direction: column;
    width: $min-stepwidth;
    color: var(--c-contrast);

  }

  .action {
    padding-top: 5px;
    padding-bottom: 5px;

    &:hover {
      background-color: var(--c-base-300);
    }

    &.selected {
      box-shadow: -8px 0px 0px 0px $brand;
      background-color: var(--c-base-100);
    }

  }

  .header {
    width: $min-stepwidth;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    padding: 8px 6px 8px 12px;
    position: relative;

    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 5px;
    border-radius: 14px 14px 0px 0px;
    color: $white;
    @include neon-bg;

    &:not(.disabled) {
      cursor: move;
    }

    &.closed {
      border-radius: 14px 14px 14px 14px;
    }

    .title {
      flex-grow: 1;
      cursor: move;
    }

  }





  .footer {
    padding: 8px 0 8px 12px;
  }

  .outside-footer {
    visibility: hidden;
    position: absolute;
    bottom: -12px;
    // left: calc(50% - 70px);
    display: flex;
    gap: 10px;
    width: 275px;
    justify-content: center;

    .opener {


      &.open {
        transform: rotate(-180deg);
        transition: transform 150ms ease;
      }

      &.closed {
        transform: rotate(-360deg);
        transition: transform 150ms ease;
      }
    }
  }


}




.target-handle {
  position: absolute;

  right: -6px;
  bottom: 16px;
  width: 12px;
}

.handle {
  // position: absolute;
  // top: 9px;
  // left: 8px;
  // bottom: 7px;
  width: 10px;
  height: 10px;
  border-radius: 14px;
  background-color: var(--c-base-200);

  opacity: 0.2;

  &.vue-flow__handle-connecting.vue-flow__handle-valid:hover {
    opacity: 1;
    background-color: var(--c-flow-node-connector);
  }
}

.step-node:not(.no-start-connection) {
  .handle {
    opacity: 1 !important;
    background-color: $success;
  }
}

// .no-start-connection {
//   background-color: var(--flow-node-warning-back);
//   border-radius: 10px;
//   display: flex;
//   flex-direction: column;
//   padding: 8px;
//   gap: 8px;
//   margin-bottom: 10px;
//   font-weight: normal;
//   font-style: italic;
// }

.actions {
  background-color: var(--c-flow-actions);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  gap: 8px;

  .action {
    //background-color: #fff;

    &.ghost {
      background-color: $brand;
      color: #fff;
    }

    &.drag {
      // max-width: 200px;
      opacity: 1;
      border-radius: 10px;
      background-color: var(--c-contrast);
      color: var(--c-base);
    }


  }
}

.no-actions {
  padding: 10px;
  text-align: center;
  display: grid;
  gap: 10px;

  opacity: 0.7;

  .title {
    font-weight: 600;

  }

  .message {
    font-style: italic;
    font-weight: normal;
    font-size: $text-size-regular;
  }


}
</style>
