import { DropdownOption, DropdownOptionType } from "@/components/atoms/TickDropdown.vue";
import { error } from "@/log";
import { translate } from '@/plugins/translatePlugin';
import FlowRtcHub from "@/services/rtc/FlowRtcHub";
import useFlowStore from "@/store/flows";
import {
  AddTaskSettingsData,
  BotActionTypeEnum,
  BotChoiceSettings,
  BotSearchKnowledgeBaseActionData,
  BotTextualQuestionActionData,
  ColorsEnum,
  CommunicatorActionTypeEnum,
  CommunicatorLogicSettings,
  ConditionLogicalOperator,
  ConditionOperator,
  ConditionType,
  DataAdapterTypeEnum,
  DatabagActionTypeEnum,
  DatabagCalculateSettingsData,
  FlowActionFlowActionsSettings,
  FlowActionType,
  FlowActionTypeEnum,
  FlowDefinitionAction,
  FlowStep,
  LanguagePath,
  NavigateActionTypeEnum,
  NextStepLogicConditionalNavigateData,
  OptionsSourceEnum,
  SpecialActionTypeEnum,
  SpecialTransferCallSettings,
  TaskInstanceStatus,
  TaskTypeEnum,
  TicketLogicActionTypeEnum,
  TickFlowDefinition,
  TickFlowDefinitionMetaData,
  TickFlowInstanceTravelingData,
  UIPositionData,
  UpdateActionRequest
} from "@/TickApi";
import { ApiDataAdapterActionSettings, BotActionSettings, ConditionalNavigateActionSettings, getReadonlyActionSettings, TicketAssignmentsLogicActionSettings, TicketLabelsLogicActionSettings, TicketLogicActionSettings, TicketTitleActionSettings, } from "@/TickApiModels";
import { clone } from "./cloneHelper";
import { getColorHex } from "./colorsHelper";
import { getDebounced } from "./debounce";
import generateId from "./guid";
import { jsonProxy } from "./jsonProxy";


const failure = "failure";
const bypass = "bypass";
// Models for UI
export interface NodeMoveParams extends UIPositionData {
  id: string;
}

export interface Connection {
  source: string;
  sourceStep: string;
  sourceActionId?: string;
  sourceActionOption?: string;
  target: string;
  targetStep: string;
  color?: string;
  animated: boolean;
}


export interface actionCreationOption {
  stepId: string;
  actionType: number;
  subActionType?: number;
}

export function getCreateActionValue(
  stepId: string,
  actionType: number,
  subActionType?: number
): string {
  const actionTypeValue: actionCreationOption = {
    actionType: actionType,
    subActionType: subActionType,
    stepId: stepId,
  };
  return JSON.stringify(actionTypeValue);
}

export function getActionOptions(stepId: string, hasPhoneChannel: boolean): DropdownOption[] {
  const list = [];

  //const allowKnowledgeBase = useUserStore().developmentFeatureIsAllowed(DevelopmentFeature.Knowledgebase);

  list.push(
    {
      text: translate(LanguagePath.App_FlowEditor_NewAction_Bot_Message),
      icon: "message",
      id: getCreateActionValue(
        stepId,
        FlowActionType.BOT,
        BotActionTypeEnum.Message
      )
    });

  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Bot_Question),
    icon: "message",
    id: getCreateActionValue(
      stepId,
      FlowActionType.BOT,
      BotActionTypeEnum.TextualQuestion
    ),
  });

  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Bot_Choice),
    icon: "message",
    id: getCreateActionValue(
      stepId,
      FlowActionType.BOT,
      BotActionTypeEnum.Choice
    ),
  });

  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Bot_KnowledgeBase),
    icon: "knowledgebase",
    id: getCreateActionValue(
      stepId,
      FlowActionType.BOT,
      BotActionTypeEnum.SearchKnowledgeBase
    ),
  });

  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Bot_InternalNote),
    icon: "message",
    id: getCreateActionValue(
      stepId,
      FlowActionType.BOT,
      BotActionTypeEnum.InternalNote
    ),
  });


  list.push({
    type: DropdownOptionType.spacer,
    text: "",
    icon: "",
    id: generateId(),
  });

  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Communicator_CommunicatorLogic),
    icon: "contacts",
    id: getCreateActionValue(
      stepId,
      FlowActionType.Communicator,
      CommunicatorActionTypeEnum.CommunicatorLogic
    ),
  });

  list.push({
    type: DropdownOptionType.spacer,
    text: "",
    icon: "",
    id: generateId(),
  });
  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Ticket_Label),
    icon: "label",
    id: getCreateActionValue(
      stepId,
      FlowActionType.TicketLogic,
      TicketLogicActionTypeEnum.TicketLabels
    ),
  });
  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Ticket_Assignments),
    icon: "users",
    id: getCreateActionValue(
      stepId,
      FlowActionType.TicketLogic,
      TicketLogicActionTypeEnum.TicketAssignments
    ),
  });
  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Task_AddTask),
    icon: "task",
    id: getCreateActionValue(
      stepId,
      FlowActionType.Task,
      TaskTypeEnum.AddTask
    ),
  });


  if (hasPhoneChannel) {

    list.push({
      type: DropdownOptionType.spacer,
      text: "",
      icon: "",
      id: generateId(),
    });

    list.push({
      text: translate(LanguagePath.App_FlowEditor_NewAction_Special_TransferCall),
      icon: "phone",
      id: getCreateActionValue(
        stepId,
        FlowActionType.Special,
        SpecialActionTypeEnum.TransferCall
      ),
    });
  }


  list.push({
    type: DropdownOptionType.spacer,
    text: "",
    icon: "",
    id: generateId(),
  });

  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_DataAdapter_ApiAdapter),
    icon: "adapter",
    id: getCreateActionValue(
      stepId,
      FlowActionType.DataAdapter,
      DataAdapterTypeEnum.ApiAdapter
    ),
  });
  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Databag_Calculate),
    icon: "databag",
    id: getCreateActionValue(
      stepId,
      FlowActionType.DatabagLogic,
      DatabagActionTypeEnum.Calculate
    ),
  });


  list.push({
    type: DropdownOptionType.spacer,
    text: "",
    icon: "",
    id: generateId(),
  });


  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Flow_Navigate),
    icon: "flow",
    id: getCreateActionValue(
      stepId,
      FlowActionType.FlowLogic,
      FlowActionTypeEnum.FlowNavigation
    ),
  });
  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Navigate_Conditional),
    icon: "navigate",
    id: getCreateActionValue(
      stepId,
      FlowActionType.Navigate,
      NavigateActionTypeEnum.Conditional
    ),
  });


  list.push({
    type: DropdownOptionType.spacer,
    text: "",
    icon: "",
    id: generateId(),
  });


  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Ticket_Title),
    icon: "ticket",
    id: getCreateActionValue(
      stepId,
      FlowActionType.TicketLogic,
      TicketLogicActionTypeEnum.TicketTitle
    ),
  });

  list.push({
    text: translate(LanguagePath.App_FlowEditor_NewAction_Ticket_Ticket),
    icon: "finish",
    id: getCreateActionValue(
      stepId,
      FlowActionType.TicketLogic,
      TicketLogicActionTypeEnum.Ticket
    ),
  });
  return list;
}

export function getConditionOperatorOptions() {
  const list = [
    {
      text: translate(LanguagePath.App_ConditionOperator_Does),
      value: ConditionOperator.Does,
    },
    {
      text: translate(LanguagePath.App_ConditionOperator_DoesNot),
      value: ConditionOperator.DoesNot,
    },
  ];

  return list;
}

export function getConditionTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.App_ConditionType_Contains),
      value: ConditionType.Contains,
    },
    {
      text: translate(LanguagePath.App_ConditionType_Match),
      value: ConditionType.Match,
    },
    {
      text: translate(LanguagePath.App_ConditionType_GreaterThen),
      value: ConditionType.GreaterThen,
    },
    {
      text: translate(LanguagePath.App_ConditionType_SmallerThen),
      value: ConditionType.SmallerThen,
    },
  ];

  return list;
}

export function getLogicalOperatorOptions() {
  const list = [
    {
      text: translate(LanguagePath.ConditionGroupLogicalOperator_All),
      value: ConditionLogicalOperator.All,
    },
    {
      text: translate(LanguagePath.ConditionGroupLogicalOperator_Any),
      value: ConditionLogicalOperator.Any,
    },
  ];

  return list;
}

export function stepHasStartConnection(
  step: FlowStep,
  connections: Connection[]
): boolean {
  const firstStepConnection = connections.find((p) => p.targetStep == step.id);
  if (firstStepConnection) {
    return true;
  } // no need to dig deeper
}

export function calculateConnections(flow: TickFlowDefinition, travel?: TickFlowInstanceTravelingData): Connection[] {

  const connections: Connection[] = [];
  if (flow.startStepId) {
    connections.push({
      source: "start",
      target: flow.startStepId,
      sourceStep: "start",
      targetStep: flow.startStepId,
      animated: travel?.breadCrumbs[0]?.targetStepId == flow.startStepId,
    });
  }

  flow.steps.forEach((step) => {
    const stepTravelData = travel?.breadCrumbs?.filter(p => p.sourceStepId == step.id);

    if (step.targetStepId) {
      connections.push({
        source: getConnectionHandleId(step.id),
        sourceStep: step.id,
        target: getConnectionHandleId(step.targetStepId),
        targetStep: step.targetStepId,
        animated: stepTravelData?.some(p => p.sourceActionId == null && p.targetStepId == step.targetStepId),
      });
    }

    step.actions.forEach((action) => {
      const actionTravelData = stepTravelData?.filter(p => p.sourceActionId == action.id);


      const settings = getReadonlyActionSettings(
        action.actionType,
        action.actionSettingsJson
      );

      switch (action.actionType) {
        case FlowActionType.BOT: {

          if (settings.actionType == BotActionTypeEnum.TextualQuestion) {
            const questionSettings = jsonProxy<BotTextualQuestionActionData>(
              settings.actionDataJson || "{}",
              (json) => {
                settings.actionDataJson = json;
              }
            );

            if (questionSettings.awaitResponseSettings != null && questionSettings.awaitResponseSettings.failureTargetStepId) {
              connections.push({
                source: getConnectionHandleId(step.id, action.id, failure),
                sourceStep: step.id,
                sourceActionId: action.id,
                sourceActionOption: failure,
                target: getConnectionHandleId(questionSettings.awaitResponseSettings.failureTargetStepId),
                targetStep: questionSettings.awaitResponseSettings.failureTargetStepId,
                color: getColorHex(ColorsEnum.Red),
                animated: actionTravelData?.some(p =>
                  p.sourceActionOptionId == failure
                  && p.targetStepId == questionSettings.awaitResponseSettings.failureTargetStepId),
              });
            }

            if (questionSettings.navigateConditions && questionSettings.navigateConditions.length) {

              questionSettings.navigateConditions.forEach((route) => {
                if (route.targetStepId) {
                  connections.push({
                    source: getConnectionHandleId(step.id, action.id, route.id),
                    sourceStep: step.id,
                    sourceActionId: action.id,
                    sourceActionOption: route.id,
                    target: getConnectionHandleId(route.targetStepId),
                    targetStep: route.targetStepId,
                    color: getColorHex(ColorsEnum.Green),
                    animated: actionTravelData?.some(p => p.sourceActionOptionId == route.id
                      && p.targetStepId == route.targetStepId),
                  });
                }
              });
            }

          }

          //---- KB

          if (settings.actionType == BotActionTypeEnum.SearchKnowledgeBase) {
            const searchKnowledgeBaseSettingsSettings = jsonProxy<BotSearchKnowledgeBaseActionData>(
              settings.actionDataJson || "{}",
              (json) => {
                settings.actionDataJson = json;
              }
            );

            // no articles found
            if (searchKnowledgeBaseSettingsSettings.awaitResponseSettings != null && searchKnowledgeBaseSettingsSettings.awaitResponseSettings.failureTargetStepId) {
              connections.push({
                source: getConnectionHandleId(step.id, action.id, failure),
                sourceStep: step.id,
                sourceActionId: action.id,
                sourceActionOption: failure,
                target: getConnectionHandleId(searchKnowledgeBaseSettingsSettings.awaitResponseSettings.failureTargetStepId),
                targetStep: searchKnowledgeBaseSettingsSettings.awaitResponseSettings.failureTargetStepId,
                color: getColorHex(ColorsEnum.Red),
                animated: actionTravelData?.some(p => p.targetStepId == searchKnowledgeBaseSettingsSettings.awaitResponseSettings.failureTargetStepId),
              });
            }

            if (searchKnowledgeBaseSettingsSettings.bypassTargetStepId != null) {
              connections.push({
                source: getConnectionHandleId(step.id, action.id, bypass),
                sourceStep: step.id,
                sourceActionId: action.id,
                sourceActionOption: bypass,
                target: getConnectionHandleId(searchKnowledgeBaseSettingsSettings.bypassTargetStepId),
                targetStep: searchKnowledgeBaseSettingsSettings.bypassTargetStepId,
                color: getColorHex(ColorsEnum.Yellow),
                animated: actionTravelData?.some(p =>
                  p.sourceActionOptionId == bypass
                  && p.targetStepId == searchKnowledgeBaseSettingsSettings.bypassTargetStepId),
              });
            }
          }


          //----

          if (settings.actionType == BotActionTypeEnum.Choice) {
            const choiceSettings = jsonProxy<BotChoiceSettings>(
              settings.actionDataJson || "{}",
              (json) => {
                settings.actionDataJson = json;
              }
            );

            if (choiceSettings.awaitResponseSettings != null && choiceSettings.awaitResponseSettings.failureTargetStepId) {
              connections.push({
                source: getConnectionHandleId(step.id, action.id, failure),
                sourceStep: step.id,
                sourceActionId: action.id,
                sourceActionOption: failure,
                target: getConnectionHandleId(choiceSettings.awaitResponseSettings.failureTargetStepId),
                targetStep: choiceSettings.awaitResponseSettings.failureTargetStepId,
                color: getColorHex(ColorsEnum.Red),
                animated: actionTravelData?.some(p =>
                  p.sourceActionOptionId == failure
                  && p.targetStepId == choiceSettings.awaitResponseSettings.failureTargetStepId),
              });
            }


            if (choiceSettings.optionsSource == OptionsSourceEnum.Options) {
              choiceSettings.options.forEach((route) => {
                if (route.targetStepId) {
                  connections.push({
                    source: getConnectionHandleId(step.id, action.id, route.id),
                    sourceStep: step.id,
                    sourceActionId: action.id,
                    sourceActionOption: route.id,
                    target: getConnectionHandleId(route.targetStepId),
                    targetStep: route.targetStepId,
                    color: getColorHex(ColorsEnum.Yellow),
                    animated: actionTravelData?.some(p => p.sourceActionOptionId == route.id
                      && p.targetStepId == route.targetStepId),
                  });
                }
              });
            }
          }


          break;
        }
        case FlowActionType.DataAdapter: {
          const dataAdapterSettings = jsonProxy<{ failTargetStepId: string }>(
            settings.actionDataJson || "{}",
            (json) => {
              settings.actionDataJson = json;
            }
          );

          if (dataAdapterSettings.failTargetStepId) {
            connections.push({
              source: getConnectionHandleId(step.id, action.id, failure),
              sourceStep: step.id,
              sourceActionId: action.id,
              sourceActionOption: failure,
              target: getConnectionHandleId(
                dataAdapterSettings.failTargetStepId
              ),
              targetStep: dataAdapterSettings.failTargetStepId,
              color: getColorHex(ColorsEnum.Red),
              animated: actionTravelData?.some(p =>
                p.sourceActionOptionId == failure
                && p.targetStepId == dataAdapterSettings.failTargetStepId),
            });
          }

          break;
        }
        case FlowActionType.Navigate: {
          const navSettings = jsonProxy<NextStepLogicConditionalNavigateData>(
            settings.actionDataJson || "{}",
            (json) => {
              settings.actionDataJson = json;
            }
          );

          navSettings.navigateConditions.forEach((route) => {
            if (route.targetStepId) {
              connections.push({
                source: getConnectionHandleId(step.id, action.id, route.id),
                sourceStep: step.id,
                sourceActionId: action.id,
                sourceActionOption: route.id,
                target: getConnectionHandleId(route.targetStepId),
                targetStep: route.targetStepId,
                color: getColorHex(ColorsEnum.Green),
                animated: actionTravelData?.some(p => p.sourceActionOptionId == route.id
                  && p.targetStepId == route.targetStepId),
              });
            }
          });

          break;
        }
        case FlowActionType.Task: {
          const taskSettings = jsonProxy<AddTaskSettingsData>(
            settings.actionDataJson || "{}",
            (json) => {
              settings.actionDataJson = json;
            }
          );

          if (!taskSettings.useAsync) {
            if (taskSettings.actionRoutes) {
              taskSettings.actionRoutes.forEach((route) => {
                if (route.targetStepId) {
                  const color =
                    route.targetStatus == TaskInstanceStatus.Finished
                      ? getColorHex(ColorsEnum.Green)
                      : getColorHex(ColorsEnum.Red);

                  connections.push({
                    source: getConnectionHandleId(
                      step.id,
                      action.id,
                      route.taskActionId
                    ),
                    sourceStep: step.id,
                    sourceActionId: action.id,
                    sourceActionOption: route.taskActionId,
                    target: getConnectionHandleId(route.targetStepId),
                    targetStep: route.targetStepId,
                    color: color,
                    animated: actionTravelData?.some(p => p.sourceActionOptionId == route.taskActionId
                      && p.targetStepId == route.targetStepId),
                  });
                }
              });
            }
          }

          break;
        }

        case FlowActionType.Special: {
          const specialSettings = jsonProxy<{ failTargetStepId: string }>(
            settings.actionDataJson || "{}",
            (json) => {
              settings.actionDataJson = json;
            }
          );

          if (specialSettings.failTargetStepId) {
            connections.push({
              source: getConnectionHandleId(step.id, action.id, failure),
              sourceStep: step.id,
              sourceActionId: action.id,
              sourceActionOption: failure,
              target: getConnectionHandleId(
                specialSettings.failTargetStepId
              ),
              targetStep: specialSettings.failTargetStepId,
              color: getColorHex(ColorsEnum.Red),
              animated: actionTravelData?.some(p =>
                p.sourceActionOptionId == failure
                && p.targetStepId == specialSettings.failTargetStepId),
            });
          }

          break;
        }


        default: {
          break;
        }
      }
    });
  });

  return connections;
}

export function getStepConnectionHandleId(stepId: string): string {
  const id = `${stepId}`;
  return id;
}

export function getConnectionHandleId(
  stepId: string,
  actionId?: string,
  optionId?: string
): string {
  let id = `${stepId}`;

  if (actionId) {
    id += `|${actionId}`;

    if (optionId) {
      id += `|${optionId}`;
    }
  }

  return id;
}

export interface ConnectionHandle {
  stepId: string;
  actionId?: string;
  optionId?: string;
}

export function parseConnectionHandleId(id: string): ConnectionHandle {
  const parts = (id || "").split("|");

  if (!parts.length) {
    throw new Error(`Can't parse connection handle id "${id}"`);
  }

  return {
    stepId: parts[0],
    actionId: parts[1],
    optionId: parts[2],
  };
}

function validateConnect(
  steps: readonly FlowStep[],
  source: ConnectionHandle,
  target: ConnectionHandle
) {
  const sourceStep = steps.find((s) => s.id == source.stepId);

  if (!sourceStep) {
    throw new Error("Invalid source for connection - target is not a step.");
  }

  const sourceAction = sourceStep.actions.find((a) => a.id === source.actionId);
  if (source.actionId && !sourceAction) {
    throw new Error("Invalid source for connection - source is not an action.");
  }

  const targetStep = steps.find((s) => s.id == target.stepId);
  if (!targetStep) {
    throw new Error("Invalid target for connection - target is not a step.");
  }

}

export interface ConnectionActionDetails {
  step: FlowStep;
  action?: FlowDefinitionAction;
}

export function connect(
  steps: readonly FlowStep[],
  sourceId: string,
  targetId: string,
  validate: boolean,
): ConnectionActionDetails {

  const source = parseConnectionHandleId(sourceId);
  const target = parseConnectionHandleId(targetId);

  if (validate) {
    validateConnect(steps, source, target);
  }

  const step: FlowStep = JSON.parse(
    JSON.stringify(steps.find((s) => s.id == source.stepId))
  );

  if (source.actionId) {
    // handle action target
    const action = step.actions.find((a) => a.id === source.actionId);
    if (!source.optionId) {
      const settings = jsonProxy<{ targetStepId: string }>(
        action.actionSettingsJson || "{}",
        (json) => {
          action.actionSettingsJson = json;
        }
      );
      settings.targetStepId = target.stepId;
    } else {
      // handle source.optionId

      const actionSettings = jsonProxy<{ actionDataJson: string, actionType: number }>(
        action.actionSettingsJson || "{}",
        (json) => {
          action.actionSettingsJson = json;
        }
      );

      switch (action.actionType) {
        case FlowActionType.BOT: {
          if (actionSettings.actionType == BotActionTypeEnum.TextualQuestion) {
            const questionSettings = jsonProxy<BotTextualQuestionActionData>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );

            if (source.optionId == failure) {
              if (questionSettings.awaitResponseSettings != null) {
                questionSettings.awaitResponseSettings.failureTargetStepId = target.stepId;
                //FIXME: proxy needs to see deep changes
                questionSettings.awaitResponseSettings = clone(questionSettings.awaitResponseSettings);
              }
            } else {
              const route = questionSettings.navigateConditions.find(
                (p) => p.id == source.optionId
              );
              route.targetStepId = target.stepId;

              //fixme: proxy needs to see array changes
              questionSettings.navigateConditions = questionSettings.navigateConditions.slice();
            }
          }
          //--

          if (actionSettings.actionType == BotActionTypeEnum.SearchKnowledgeBase) {
            const botSearchKnowledgeBaseActionData: BotSearchKnowledgeBaseActionData = jsonProxy<BotSearchKnowledgeBaseActionData>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );

            if (source.optionId == failure) {
              if (botSearchKnowledgeBaseActionData.awaitResponseSettings != null) {
                botSearchKnowledgeBaseActionData.awaitResponseSettings.failureTargetStepId = target.stepId;
                //FIXME: proxy needs to see deep changes
                botSearchKnowledgeBaseActionData.awaitResponseSettings = clone(botSearchKnowledgeBaseActionData.awaitResponseSettings);
              }
            }

            if (source.optionId == bypass) {
              botSearchKnowledgeBaseActionData.bypassTargetStepId = target.stepId;
            }
          }

          //---

          if (actionSettings.actionType == BotActionTypeEnum.Choice) {
            const choiceSettings = jsonProxy<BotChoiceSettings>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );

            if (source.optionId == failure) {

              if (choiceSettings.awaitResponseSettings != null) {
                choiceSettings.awaitResponseSettings.failureTargetStepId = target.stepId;

                //FIXME: proxy needs to see deep changes
                choiceSettings.awaitResponseSettings = clone(choiceSettings.awaitResponseSettings);
              }
            } else {
              const route = choiceSettings.options.find(
                (p) => p.id == source.optionId
              );
              route.targetStepId = target.stepId;
              //fixme: proxy needs to see array changes
              choiceSettings.options = choiceSettings.options.slice();
            }

          }

          break;
        }
        case FlowActionType.DataAdapter: {
          const dataAdapterSettings = jsonProxy<{ failTargetStepId: string }>(
            actionSettings.actionDataJson || "{}",
            (json) => {
              actionSettings.actionDataJson = json;
            }
          );

          dataAdapterSettings.failTargetStepId = target.stepId;
          break;
        }
        case FlowActionType.Special: {

          if (actionSettings.actionType == SpecialActionTypeEnum.TransferCall) {
            const transferCallActionData: SpecialTransferCallSettings = jsonProxy<SpecialTransferCallSettings>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );


            transferCallActionData.failTargetStepId = target.stepId;

          }
          break;

        }
        case FlowActionType.Navigate: {
          const navSettings = jsonProxy<NextStepLogicConditionalNavigateData>(
            actionSettings.actionDataJson || "{}",
            (json) => {
              actionSettings.actionDataJson = json;
            }
          );

          const route = navSettings.navigateConditions.find(
            (p) => p.id == source.optionId
          );
          route.targetStepId = target.stepId;

          //fixme: proxy needs to see array changes
          navSettings.navigateConditions = navSettings.navigateConditions.slice();

          break;
        }
        case FlowActionType.Task: {
          const taskSettings = jsonProxy<AddTaskSettingsData>(
            actionSettings.actionDataJson || "{}",
            (json) => {
              actionSettings.actionDataJson = json;
            }
          );

          const route = taskSettings.actionRoutes.find(
            (p) => p.taskActionId == source.optionId
          );
          route.targetStepId = target.stepId;
          //fixme: proxy needs to see array changes
          taskSettings.actionRoutes = taskSettings.actionRoutes.slice();

          break;
        }

        default: {
          error(
            "Trying to connect but can't because actionType has no programming for it"
          );

          break;
        }
      }
    }
    return { step: step, action };
  } else {
    // handle next step targte
    step.targetStepId = target.stepId;
    return { step: step };
  }
}

export function disconnect(
  steps: readonly FlowStep[],
  sourceId: string
): ConnectionActionDetails {
  const source = parseConnectionHandleId(sourceId);

  const step: FlowStep = JSON.parse(
    JSON.stringify(steps.find((s) => s.id == source.stepId))
  );
  if (source.actionId) {
    const action = step.actions.find((a) => a.id === source.actionId);

    if (!source.optionId) {
      const settings = jsonProxy<{ targetStepId: string }>(
        action.actionSettingsJson || "{}",
        (json) => {
          action.actionSettingsJson = json;
        }
      );

      settings.targetStepId = null;
    } else {
      //  handle source.optionId
      const actionSettings = jsonProxy<{ actionDataJson: string, actionType: number }>(
        action.actionSettingsJson || "{}",
        (json) => {
          action.actionSettingsJson = json;
        }
      );

      switch (action.actionType) {
        case FlowActionType.BOT: {

          //--
          if (actionSettings.actionType == BotActionTypeEnum.TextualQuestion) {
            const questionSettings = jsonProxy<BotTextualQuestionActionData>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );

            if (source.optionId == failure) {
              if (questionSettings.awaitResponseSettings != null) {
                questionSettings.awaitResponseSettings.failureTargetStepId = null;
                //FIXME: proxy needs to see deep changes
                questionSettings.awaitResponseSettings = clone(questionSettings.awaitResponseSettings);
              }
            } else {
              const route = questionSettings.navigateConditions.find((p) => p.id == source.optionId);
              route.targetStepId = null;

              //fixme: proxy needs to see array changes
              questionSettings.navigateConditions = questionSettings.navigateConditions.slice();
            }
          }


          //---

          if (actionSettings.actionType == BotActionTypeEnum.SearchKnowledgeBase) {
            const searchKnowledgeBaseSettings = jsonProxy<BotSearchKnowledgeBaseActionData>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );

            if (source.optionId == failure) {
              if (searchKnowledgeBaseSettings.awaitResponseSettings != null) {
                searchKnowledgeBaseSettings.awaitResponseSettings.failureTargetStepId = null;
                //FIXME: proxy needs to see deep changes
                searchKnowledgeBaseSettings.awaitResponseSettings = clone(searchKnowledgeBaseSettings.awaitResponseSettings);
              }
            }
            if (source.optionId == bypass) {
              searchKnowledgeBaseSettings.bypassTargetStepId = null;
            }

          }

          //---

          if (actionSettings.actionType == BotActionTypeEnum.Choice) {
            const choiceSettings = jsonProxy<BotChoiceSettings>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );


            if (source.optionId == failure) {
              if (choiceSettings.awaitResponseSettings != null) {
                choiceSettings.awaitResponseSettings.failureTargetStepId = null;
                //FIXME: proxy needs to see deep changes
                choiceSettings.awaitResponseSettings = clone(choiceSettings.awaitResponseSettings);

              }
            } else {
              const route = choiceSettings.options.find((p) => p.id == source.optionId);
              route.targetStepId = null;

              //fixme: proxy needs to see array changes
              choiceSettings.options = choiceSettings.options.slice();
            }
          }

          break;
        }
        case FlowActionType.DataAdapter: {
          const dataAdapterSettings = jsonProxy<{ failTargetStepId: string }>(
            actionSettings.actionDataJson || "{}",
            (json) => {
              actionSettings.actionDataJson = json;
            }
          );

          dataAdapterSettings.failTargetStepId = null;
          break;
        }
        case FlowActionType.Special: {

          if (actionSettings.actionType == SpecialActionTypeEnum.TransferCall) {
            const transferCallActionData: SpecialTransferCallSettings = jsonProxy<SpecialTransferCallSettings>(
              actionSettings.actionDataJson || "{}",
              (json) => {
                actionSettings.actionDataJson = json;
              }
            );


            transferCallActionData.failTargetStepId = null;

          }
          break;

        }
        case FlowActionType.Navigate: {
          const navSettings = jsonProxy<NextStepLogicConditionalNavigateData>(
            actionSettings.actionDataJson || "{}",
            (json) => {
              actionSettings.actionDataJson = json;
            }
          );

          const route = navSettings.navigateConditions.find((p) => p.id == source.optionId);
          route.targetStepId = null;

          //fixme: proxy needs to see array changes
          navSettings.navigateConditions = navSettings.navigateConditions.slice();
          break;
        }
        case FlowActionType.Task: {
          const taskSettings = jsonProxy<AddTaskSettingsData>(
            actionSettings.actionDataJson || "{}",
            (json) => {
              actionSettings.actionDataJson = json;
            }
          );

          const route = taskSettings.actionRoutes.find(
            (p) => p.taskActionId == source.optionId
          );
          route.targetStepId = null;
          //fixme: proxy needs to see array changes
          taskSettings.actionRoutes = taskSettings.actionRoutes.slice();

          break;
        }

        default: {
          error(`[FlowHelpers:Disconnect] can't resolve ${action.actionType}.`);
          break;
        }
      }
    }

    return { step: step, action };
  } else {
    step.targetStepId = null;

    return { step: step };
  }
}

export function replyParsingLabel(
  settings: BotActionSettings,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data: BotTextualQuestionActionData
): string {
  if (settings.actionType !== BotActionTypeEnum.TextualQuestion) {
    return "";
  }

  return translate(LanguagePath.App_FlowEditor_QuestionReply_HasExtractionStrategy_Title);
  // const label = data.answerExtractionRegEx
  //   ? translate(LanguagePath.App_FlowEditor_QuestionReply_HasExtractionStrategy_Title)
  //   : "Capture full reply";

  // if (data.validationType !== ValidationTypeEnum.Text) {
  //   return `${label} and validate`;
  // }

  // return label;
}

export function getBotActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<BotActionSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}
export function getBotChoiceActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<BotChoiceSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getAdapterActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<ApiDataAdapterActionSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getAddTaskActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<AddTaskSettingsData>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getDatabagCalculationActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<DatabagCalculateSettingsData>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getSpecialTransferCallActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<SpecialTransferCallSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}
export function getCommunicatorLogicActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<CommunicatorLogicSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getFlowNavigateToSubFlowActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<FlowActionFlowActionsSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}
export function getTicketLogicActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<TicketLogicActionSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getTicketLabelsLogicActionSettings(json: string, flowDefinitionId: string, stepId: string, actionId: string, actionName: string
) {
  return getActionSettings<TicketLabelsLogicActionSettings>(json, flowDefinitionId, stepId, actionId, actionName);
}

export function getTicketTitleLogicActionSettings(json: string, flowDefinitionId: string, stepId: string, actionId: string, actionName: string
) {
  return getActionSettings<TicketTitleActionSettings>(json, flowDefinitionId, stepId, actionId, actionName);
}


export function getTicketAssignmentsLogicActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<TicketAssignmentsLogicActionSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getConditionalNavigateActionSettings(
  json: string,
  flowDefinitionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return getActionSettings<ConditionalNavigateActionSettings>(
    json,
    flowDefinitionId,
    stepId,
    actionId,
    actionName
  );
}

export function getActionSettings<T>(
  json: string,
  flowVersionId: string,
  stepId: string,
  actionId: string,
  actionName: string
) {
  return jsonProxy<T>(json, (settingsJson) => {
    // todo: patch action directly

    useFlowStore().patchActionSettingsJson(flowVersionId, stepId, actionId, settingsJson);


    const update: UpdateActionRequest = {
      flowVersionId,
      stepId,
      actionId,
      name: actionName,
      settingsJson,
    };

    patchFlowAction(update);
  });
}

export const patchFlowAction = getDebounced<UpdateActionRequest>(
  (update: UpdateActionRequest) => {
    FlowRtcHub.updateAction(update);
  }, 2000
);



export function patchFlowMetadata(flow: TickFlowDefinition, delta: Partial<TickFlowDefinitionMetaData>) {
  const source: Required<TickFlowDefinitionMetaData> = {
    id: flow.id,
    versionId: flow.versionId,
    name: flow.name,
    trigger: flow.trigger,
    startStepId: flow.startStepId,
    settingsNodePosition: flow.settingsNodePosition,
    startConditionsJson: flow.startConditionsJson,
    skipConditionsJson: flow.skipConditionsJson,
    startOnCommunicationChannelIds: flow.startOnCommunicationChannelIds,
    defaultBotUserId: flow.defaultBotUserId,
    executionEnvironmentId: flow.executionEnvironmentId,
    developmentData: flow.developmentData,
    active: flow.active,
    isDeleted: flow.isDeleted,
  };

  const update = { ...source, ...delta };

  // null values are used to unset properties
  for (const key in update) {
    if ((update as unknown)[key] === null) {
      delete (update as unknown)[key];
    }
  }

  useFlowStore().patchFlow(update);
  patchFlowMetadataDebounced({ flow, delta });
}


export const patchFlowMetadataDebounced = getDebounced<{
  flow: TickFlowDefinition;
  delta: Partial<TickFlowDefinitionMetaData>;
}>(({ flow, delta }) => {

  const source: Required<TickFlowDefinitionMetaData> = {
    id: flow.id,
    versionId: flow.versionId,
    name: flow.name,
    trigger: flow.trigger,
    startStepId: flow.startStepId,
    settingsNodePosition: flow.settingsNodePosition,
    startConditionsJson: flow.startConditionsJson,
    skipConditionsJson: flow.skipConditionsJson,
    startOnCommunicationChannelIds: flow.startOnCommunicationChannelIds,
    defaultBotUserId: flow.defaultBotUserId,
    executionEnvironmentId: flow.executionEnvironmentId,
    developmentData: flow.developmentData,
    active: flow.active,
    isDeleted: flow.isDeleted,
  };

  const update = { ...source, ...delta };

  // null values are used to unset properties
  for (const key in update) {
    if ((update as unknown)[key] === null) {
      delete (update as unknown)[key];
    }
  }

  // if (logDebug) {
  //   debug(`patchFlowMetadata: ${JSON.stringify(update)}`);
  // }

  FlowRtcHub.updateFlow(update);
});
