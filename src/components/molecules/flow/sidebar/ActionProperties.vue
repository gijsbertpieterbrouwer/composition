<template>
  <div class="properties" v-if="action">
    <div class="item-actions">
      <input type="text" class="name" v-model="actionName" :disabled="disabled" :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_Action_Name_Placeholder)" />
      <!-- <TickButton icon="copy" :title="$translate(LanguagePath.App_Copy)" :disabled="disabled" @click="copyAction" :appearance="Appearance.secondary" :color="Color.contrast" /> -->
      <TickButton icon="delete" :disabled="disabled" @click="removeAction" :appearance="Appearance.secondary" :color="Color.contrast" />
    </div>
    <div class="settings">
      <component :is="getActionComponent(this.action)" :disabled="disabled" :action="action" :settings="actionSettings(this.action)" />
      <SidebarPanel id="action-note" :name="$translate(LanguagePath.App_FlowEditor_SideBar_EditorsNote_Title)">
        <template #subheader>{{ $translate(LanguagePath.App_FlowEditor_SideBar_EditorsNote_Explanation) }}</template>
        <TickTextarea v-model="actionNote" :maxlength="500" :minimumrows="10" />
      </SidebarPanel>

    </div>
    <TickRtcIndicator />
  </div>
</template>

<script lang="ts">
import { BotActionTypeEnum, FlowActionType, FlowActionTypeEnum, FlowDefinitionAction, FlowStep, LanguagePath, NavigateActionTypeEnum, TicketLogicActionTypeEnum } from "@/TickApi";
import { getReadonlyActionSettings } from "@/TickApiModels";
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickRtcIndicator from '@/components/atoms/TickRtcIndicator.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import DataAdapterAction from "@/components/molecules/flow/sidebar/actions/DataAdapterAction.vue";
import MessageAction from "@/components/molecules/flow/sidebar/actions/MessageAction.vue";
import NoteAction from '@/components/molecules/flow/sidebar/actions/NoteAction.vue';
import { focus } from '@/directives';
import { getAdapterActionSettings, getAddTaskActionSettings, getBotActionSettings, getBotChoiceActionSettings, getCommunicatorLogicActionSettings, getConditionalNavigateActionSettings, getDatabagCalculationActionSettings, getFlowNavigateToSubFlowActionSettings, getSpecialTransferCallActionSettings, getTicketAssignmentsLogicActionSettings, getTicketLabelsLogicActionSettings, getTicketLogicActionSettings, getTicketTitleLogicActionSettings } from "@/helpers/flowhelpers";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import AddTaskAction from './actions/AddTaskAction.vue';
import CommunicatorLogicAction from "./actions/CommunicatorLogicAction.vue";
import ConditionalNavigateAction from './actions/ConditionalNavigateAction.vue';
import DatabagCalculationAction from './actions/DatabagCalculationAction.vue';
import FlowNavigateAction from './actions/FlowNavigateAction.vue';
import MessageChoiceAction from './actions/MessageChoiceAction.vue';
import MessageQuestionAction from './actions/MessageQuestionAction.vue';
import MessageSearchKnowledgeBaseAction from './actions/MessageSearchKnowledgeBaseAction.vue';
import TicketAssignmentsAction from './actions/TicketAssignmentsAction.vue';
import TicketLabelsLogicAction from './actions/TicketLabelsLogicAction.vue';
import TicketLogicAction from './actions/TicketLogicAction.vue';
import TicketTitleLogicAction from './actions/TicketTitleLogicAction.vue';
import TransferCallAction from "./actions/TransferCallAction.vue";

@Component({
  directives: { focus },
  emits: ["onNameChange", "noteChange", "delete", "copy"],
  components: {
    MessageAction,
    DataAdapterAction,
    MessageSearchKnowledgeBaseAction,
    TicketLogicAction,
    TicketLabelsLogicAction,
    TicketTitleLogicAction,
    TicketAssignmentsAction,
    FlowNavigateAction,
    ConditionalNavigateAction,
    MessageChoiceAction,
    MessageQuestionAction,
    AddTaskAction,
    NoteAction,
    DatabagCalculationAction,
    TickButton,
    TickRtcIndicator,
    TickTextarea,
    SidebarPanel,
    TransferCallAction,
    CommunicatorLogicAction
  }
})
export default class ActionProperties extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size;
  FlowActionType = FlowActionType;
  BotActionTypeEnum = BotActionTypeEnum;
  TicketLogicActionTypeEnum = TicketLogicActionTypeEnum;
  FlowActionTypeEnum = FlowActionTypeEnum;
  NavigateActionTypeEnum = NavigateActionTypeEnum;
  LanguagePath = LanguagePath
  @Prop() private step!: FlowStep;
  @Prop() private actionId!: string;
  @Prop() private flowId!: string;
  @Prop() private flowVersionId!: string;
  @Prop() private disabled!: boolean;

  private copyAction() {
    this.$emit("duplicate", this.action);
  }

  private get actionName() {
    return this.action.name;
  }
  private set actionName(to: string) {
    this.$emit("onNameChange", to);
  }

  private get actionNote() {
    return this.action.note || "";
  }
  private set actionNote(to: string) {
    this.$emit("noteChange", to);
  }

  private get action() {
    const myAction = this.step.actions.find(a => a.id == this.actionId);
    return myAction;
  }

  // private deleteAction() {
  //   if (!askConfirmation()) { return false; }
  //   this.removeAction(this.actionId);
  // }

  private actionIsOfType(action: FlowDefinitionAction, type: number) {
    const settings = getReadonlyActionSettings(action.actionType, action.actionSettingsJson);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (settings as any).actionType === type;
  }

  private actionIsNotOfType(action: FlowDefinitionAction, type: number) {
    const settings = getReadonlyActionSettings(action.actionType, action.actionSettingsJson);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (settings as any).actionType !== type;
  }

  private actionSettings(action: FlowDefinitionAction) {
    switch (action.actionType) {
      case FlowActionType.BOT:
        if (this.actionIsOfType(action, BotActionTypeEnum.Choice)) {
          return getBotChoiceActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
        } else {
          return getBotActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
        }

      case FlowActionType.TicketLogic:

        if (this.actionIsOfType(action, TicketLogicActionTypeEnum.Ticket)) {
          return getTicketLogicActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
        }
        if (this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketLabels)) {
          return getTicketLabelsLogicActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
        }
        if (this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketTitle)) {
          return getTicketTitleLogicActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
        }

        if (this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketAssignments)) {
          return getTicketAssignmentsLogicActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
        }

        throw Error("not implemented");

      case FlowActionType.Navigate:
        if (this.actionIsOfType(action, NavigateActionTypeEnum.Conditional)) {
          return getConditionalNavigateActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
        }

        throw Error("not implemented");
      case FlowActionType.DataAdapter:
        return getAdapterActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
      case FlowActionType.FlowLogic:
        return getFlowNavigateToSubFlowActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);

      case FlowActionType.Task:
        return getAddTaskActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);

      case FlowActionType.DatabagLogic:
        return getDatabagCalculationActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
      case FlowActionType.Communicator:
        return getCommunicatorLogicActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);
      case FlowActionType.Special:
        return getSpecialTransferCallActionSettings(action.actionSettingsJson, this.flowVersionId, this.step.id, action.id, action.name);

    }
  }

  private removeAction() {
    this.$emit("delete", this.step.id, this.actionId);
  }


  private getActionComponent(action: FlowDefinitionAction) {
    if (action.actionType === FlowActionType.BOT && this.actionIsOfType(action, BotActionTypeEnum.Message)) {
      return "MessageAction";
    }
    if (action.actionType === FlowActionType.BOT && this.actionIsOfType(action, BotActionTypeEnum.TextualQuestion)) {
      return "MessageQuestionAction";
    }
    if (action.actionType === FlowActionType.BOT && this.actionIsOfType(action, BotActionTypeEnum.Choice)) {
      return "MessageChoiceAction";
    }
    if (action.actionType === FlowActionType.BOT && this.actionIsOfType(action, BotActionTypeEnum.SearchKnowledgeBase)) {
      return "MessageSearchKnowledgeBaseAction";
    }
    if (action.actionType === FlowActionType.BOT && this.actionIsOfType(action, BotActionTypeEnum.InternalNote)) {
      return "NoteAction";
    }


    if (action.actionType === FlowActionType.DataAdapter) {
      return "DataAdapterAction";
    }
    if (action.actionType === FlowActionType.TicketLogic && this.actionIsOfType(action, TicketLogicActionTypeEnum.Ticket)) {
      return "TicketLogicAction";
    }
    if (action.actionType === FlowActionType.TicketLogic && this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketLabels)) {
      return "TicketLabelsLogicAction";
    }
    if (action.actionType === FlowActionType.TicketLogic && this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketTitle)) {
      return "TicketTitleLogicAction";
    }

    if (action.actionType === FlowActionType.TicketLogic && this.actionIsOfType(action, TicketLogicActionTypeEnum.TicketAssignments)) {
      return "TicketAssignmentsAction";
    }

    if (action.actionType === FlowActionType.FlowLogic && this.actionIsOfType(action, FlowActionTypeEnum.FlowNavigation)) {
      return "FlowNavigateAction";
    }

    if (action.actionType === FlowActionType.Navigate && this.actionIsOfType(action, NavigateActionTypeEnum.Conditional)) {
      return "ConditionalNavigateAction";
    }

    if (action.actionType === FlowActionType.Task) {
      return "AddTaskAction";
    }

    if (action.actionType === FlowActionType.DatabagLogic) {
      return "DatabagCalculationAction";
    }
    if (action.actionType === FlowActionType.Special) {
      return "TransferCallAction";
    }
    if (action.actionType === FlowActionType.Communicator) {
      return "CommunicatorLogicAction";
    }

    return "div";
  }

}
</script>
<style lang="scss" scoped>
@import "@/styles/theme";

.properties {
  // font-size: $text-size-regular;

  .item-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;

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

  .settings {
    margin-top: 50px;
    display: grid;
    gap: 5px;
  }

}


// .condition-button {
//   display: block;
//   padding: 0 4px;
//   transform: translateX(-4px);

//   &.active {
//     background-color: $grey200;
//   }
// }</style>