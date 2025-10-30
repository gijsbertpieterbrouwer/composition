import { BotActionTypeEnum, DataAdapterTypeEnum, DatabagActionTypeEnum, FlowActionBotSettings, FlowActionCommunicatorSettings, FlowActionDataAdapterSettings, FlowActionDatabagSettings, FlowActionFlowActionsSettings, FlowActionLogicSettings, FlowActionNavigateSettings, FlowActionSpecialSettings, FlowActionTaskSettings, FlowActionType, FlowActionTypeEnum, NavigateActionTypeEnum, TaskTypeEnum, TicketLogicActionTypeEnum } from "@/TickApi";
import { jsonProxy } from "@/helpers/jsonProxy";

export interface ChoiceBotActionSettings extends FlowActionBotSettings {
  actionType: BotActionTypeEnum.Choice;
}

export interface MessageBotActionSettings extends FlowActionBotSettings {
  actionType: BotActionTypeEnum.Message;
}

export interface NoteBotActionSettings extends FlowActionBotSettings {
  actionType: BotActionTypeEnum.InternalNote;
}

export interface TextualQuestionBotActionSettings extends FlowActionBotSettings {
  actionType: BotActionTypeEnum.TextualQuestion;
}
export interface SearchKnowledgeBaseBotActionSettings extends FlowActionBotSettings {
  actionType: BotActionTypeEnum.SearchKnowledgeBase;
}
export type BotActionSettings = ChoiceBotActionSettings | MessageBotActionSettings | TextualQuestionBotActionSettings | SearchKnowledgeBaseBotActionSettings;

export interface TicketLogicActionSettings extends FlowActionLogicSettings {
  actionType: TicketLogicActionTypeEnum.Ticket;
}

export interface TicketTitleActionSettings extends FlowActionLogicSettings {
  actionType: TicketLogicActionTypeEnum.TicketTitle;
}

export interface TicketLabelsLogicActionSettings extends FlowActionLogicSettings {
  actionType: TicketLogicActionTypeEnum.TicketLabels;
}

export interface TicketAssignmentsLogicActionSettings extends FlowActionLogicSettings {
  actionType: TicketLogicActionTypeEnum.TicketAssignments;
}

export type LogicActionSettings = TicketLogicActionSettings | TicketLabelsLogicActionSettings;

export interface ConditionalNavigateActionSettings extends FlowActionNavigateSettings {
  actionType: NavigateActionTypeEnum.Conditional;
}


// export interface DirectNavigateActionSettings extends FlowActionNavigateSettings {
//   actionType: NavigateActionTypeEnum.Direct;
// }

// export interface SwitchNavigateActionSettings extends FlowActionNavigateSettings {
//   actionType: NavigateActionTypeEnum.Switch;
// }

export type NavigateActionSettings = ConditionalNavigateActionSettings

export interface ApiDataAdapterActionSettings extends FlowActionDataAdapterSettings {
  actionType: DataAdapterTypeEnum.ApiAdapter;
}

export type DataAdapterActionSettings = ApiDataAdapterActionSettings;

export interface AddTaskActionSettings extends FlowActionTaskSettings {
  actionType: TaskTypeEnum.AddTask;
}

export type TaskActionSettings = AddTaskActionSettings;

export interface FlowNavigationFlowLogicActionSettings extends FlowActionFlowActionsSettings {
  actionType: FlowActionTypeEnum.FlowNavigation;
}


export interface DatabagCalculationActionSettings extends FlowActionDatabagSettings {
  actionType: DatabagActionTypeEnum.Calculate;
}

export type DatabagActionSettings = FlowActionDatabagSettings;




export type FlowLogicActionSettings = FlowNavigationFlowLogicActionSettings;


export function getReadonlyActionSettings(type: FlowActionType, json: string) {
  switch (type) {
    case FlowActionType.BOT:
      return jsonProxy<BotActionSettings>(json, () => { /* do nothing */ });
    case FlowActionType.DataAdapter:
      return jsonProxy<DataAdapterActionSettings>(json, () => { /* do nothing */ });
    case FlowActionType.FlowLogic:
      return jsonProxy<FlowLogicActionSettings>(json, () => { /* do nothing */ });
    case FlowActionType.TicketLogic:
      return jsonProxy<LogicActionSettings>(json, () => { /* do nothing */ });
    case FlowActionType.Navigate:
      return jsonProxy<NavigateActionSettings>(json, () => { /* do nothing */ });
    case FlowActionType.Task:
      return jsonProxy<TaskActionSettings>(json, () => { /* do nothing */ });
    case FlowActionType.DatabagLogic:
      return jsonProxy<DatabagActionSettings>(json, () => { /* do nothing */ });
    case FlowActionType.Special:
      return jsonProxy<FlowActionSpecialSettings>(json, () => { /* do nothing */ });
    case FlowActionType.Communicator:
      return jsonProxy<FlowActionCommunicatorSettings>(json, () => { /* do nothing */ });
    default:
      throw "Action type not known";

  }
}
