import { _ActionsTree, _GettersTree, defineStore } from "pinia";

import { delimitList, maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import { debugAction, error } from "@/log";
import {
  copyFlowToEnvironment,
  createFlow,
  getDetails,
  getFlowInstanceLogDetails,
  getFlowInstanceRecentLogs,
} from "@/services/FlowsService";
import flowRtcHub, { ActionWithIndex } from "@/services/rtc/FlowRtcHub";
import {
  AddFlowCommentRequest,
  CopyToEnvironmentRequest,
  FlowDefinitionAction,
  FlowStep,
  FlowTriggerEnum,
  TickFlowDefinition,
  TickFlowDefinitionMetaData,
  TickFlowInstanceLog,
  TickFlowInstanceLogSummary,
  UIPositionData
} from "@/TickApi";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

interface State {
  flows: TickFlowDefinition[];
  activeFlowId: string | undefined | null;
  activeFlowVersionId: string | undefined | null;
  activeFlowLoaded: boolean;

  projectedMousePositionX: number;
  projectedMousePositionY: number;

  logSummaries: TickFlowInstanceLogSummary[];
  logs: TickFlowInstanceLog[];
}

interface Getters extends _GettersTree<State> {
  activeFlow: (state: State) => TickFlowDefinition | undefined;
  flowVersion: (state: State) => (versionId: string) => TickFlowDefinition | undefined;

  flowInstanceLogs: (state: State) => (definitionId: string, versionId: string) => TickFlowInstanceLogSummary[];
  flowInstanceLogDetails: (state: State) => (logId: string) => TickFlowInstanceLog | undefined;
}

interface Actions extends _ActionsTree {
  use(): Promise<void>;


  activate(definitionId: string | undefined | null, versionId: string | null): Promise<void>;
  add(collectionId?: string, name?: string, trigger?: FlowTriggerEnum, startOnCommunicationChannelIds?: string[]): Promise<TickFlowDefinition>;
  deleteFlow(flowVersionId: string): void;
  copyFlowToEnvironment(
    flowVersionId: string,
    environmentId: string
  ): Promise<TickFlowDefinition>;

  // from rtc hub
  patchFlow(flow: TickFlowDefinitionMetaData): void;
  patchFlowActive(flowVersionId: string, active: boolean): void;
  patchFlowComment(flowVersionId: string, update: AddFlowCommentRequest): void;
  removeFlowComments(flowVersionId: string): void;

  patchFlowSettingsNodePosition(flowId: string, position: UIPositionData): void;
  patchStep(flowVersionId: string, step: FlowStep): void;
  patchStepPosition(
    flowVersionId: string,
    stepId: string,
    position: UIPositionData
  ): void;
  deleteStep(flowVersionId: string, stepId: string): void;
  patchAction(
    flowVersionId: string,
    stepId: string,
    action: FlowDefinitionAction
  ): void;
  patchActionSettingsJson(
    flowVersionId: string,
    stepId: string,
    actionId: string,
    actionSettingsJson: string,
  ): void;
  patchActionIndexes(
    flowVersionId: string,
    stepId: string,
    actions: ActionWithIndex[]
  ): void;
  deleteAction(flowVersionId: string, stepId: string, actionId: string): void;



  getLogsForFlow(id: string, versionId: string): Promise<void>;
  getLogDetails(id: string): Promise<TickFlowInstanceLog>;
}

const useFlowStore = defineStore<"flows", State, Getters, Actions>("flows", {
  state: () => ({
    activeFlowVersionId: null,
    activeFlowId: null,
    flows: [],
    activeFlowLoaded: false,
    projectedMousePositionX: 0,
    projectedMousePositionY: 0,
    logSummaries: [],
    logs: [],
  }),
  getters: {
    activeFlow: (state) =>
      state.flows.find(
        (f) => f.versionId === state.activeFlowVersionId
      ),

    flowVersion: (state) => (versionId: string) => {
      const flow = state.flows.find(p => p.versionId === versionId)
      return flow;
    },
    flowInstanceLogs: (state) => (definitionId: string, versionId: string) => (state.logSummaries || []).filter((p) => p.flowDefinitionId === definitionId && p.flowDefinitionVersionId === versionId),
    flowInstanceLogDetails: (state) => (logId: string) => (state.logs || []).find((p) => p.id === logId),
  },
  actions: {
    async deleteFlow(flowVersionId: string) {
      const flow = this.flowVersion(flowVersionId);
      if (flow) {
        flow.isDeleted = true;
      }
    },
    async use() {
      // const newFlows = await getFlows(useUserStore().activeWorkspaceId);

      // this.flows = newFlows.map((summary) => {
      //   const existing = this.flows.find(f => f.id === summary.id);
      //   return (existing) ? existing : summary;
      // });
    },
    async add(collectionId?: string, name?: string, trigger?: FlowTriggerEnum, startOnCommunicationChannelIds?: string[]) {
      const flow: TickFlowDefinition = await createFlow({
        workspaceId: useUserStore().activeWorkspaceId ?? "",
        collectionId: collectionId,
        name: name,
        trigger: trigger,
        startOnCommunicationChannelIds: startOnCommunicationChannelIds
      }
      );
      this.flows.push(flow);
      return flow;
    },
    async copyFlowToEnvironment(
      flowVersionId: string,
      environmentId: string
    ): Promise<TickFlowDefinition> {
      const request: CopyToEnvironmentRequest = {
        flowVersionId: flowVersionId,
        executionEnvironmentId: environmentId,
      };
      const flow: TickFlowDefinition = await copyFlowToEnvironment(request);
      this.flows.push(flow);
      return flow;
    },
    // async setFlowActive(flowId: string, active: boolean): Promise<unknown> {
    //   const request: SetFlowActiveStatusRequest = {
    //     flowDefinitionId: flowId,
    //     active: active,
    //   }

    //   const result = await setFlowActive(request);
    //   return result;
    // },

    async activate(id: string | null, versionId: string | null) {
      debugAction(`[FLOW:ACTIVATE] activate flow: ${id}  version: ${versionId}`)

      flowRtcHub.unsubscribe();

      this.activeFlowLoaded = false;

      this.activeFlowId = id;
      this.activeFlowVersionId = versionId;
      if (!id || !versionId) {
        // active flow is closed. Do not continue.
        return;
      }

      const serverData = await getDetails(this.activeFlowId as string, this.activeFlowVersionId as string);

      if (!serverData.settingsNodePosition) {
        serverData.settingsNodePosition = { x: 80, y: 80 };
      }

      this.patchFlow(serverData);
      const flow = this.flowVersion(serverData.versionId);
      if (flow) {
        flow.steps = serverData.steps || [];
        flow.comments = serverData.comments || [];
      }
      flowRtcHub.subscribe(versionId);

      this.activeFlowLoaded = true;
    },

    patchFlowActive(flowVersionId: string, active: boolean) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow) {
        return;
      }

      flow.active = active;
    },
    patchFlowComment(flowVersionId: string, update: AddFlowCommentRequest) {
      if (!update.comment) {
        return;
      }
      const flow = this.flowVersion(flowVersionId);
      if (!flow) {
        return;
      }
      if (!flow.comments) flow.comments = [];
      const index = flow.comments.findIndex((s) => s.id === update?.comment?.id);
      if (index === -1) {
        flow.comments.push(update.comment);
      } else {
        flow.comments.splice(index, 1, update.comment);
      }
    },
    removeFlowComments(flowVersionId: string) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow) {
        return;
      }

      flow.comments = [];
    },

    patchFlow(serverData: TickFlowDefinitionMetaData) {
      let flow = this.flowVersion(serverData.versionId);

      if (!flow) {
        flow = serverData as TickFlowDefinition;
        this.flows.push(flow);
        delimitList(this.flows, maxDetailsListItems)

      } else {
        flow.defaultBotUserId = serverData.defaultBotUserId;
        flow.name = serverData.name;
        flow.settingsNodePosition = serverData.settingsNodePosition;
        flow.skipConditionsJson = serverData.skipConditionsJson;
        flow.startConditionsJson = serverData.startConditionsJson;
        flow.startStepId = serverData.startStepId;
        flow.trigger = serverData.trigger;
        flow.active = serverData.active;
        flow.executionEnvironmentId = serverData.executionEnvironmentId;
      }
    },
    patchFlowSettingsNodePosition(flowVersionId: string, position: UIPositionData) {
      const flow = this.flowVersion(flowVersionId);
      if (flow) {
        flow.settingsNodePosition = position;
      }
    },
    patchStep(flowVersionId: string, step: FlowStep) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow) {
        throw new Error("Can't patch step for unknown flow.");
      }
      if (!flow.steps) flow.steps = [];
      const index = flow.steps.findIndex((s) => s.id === step.id);
      if (index === -1) {
        flow.steps.push(step);
      } else {
        flow.steps.splice(index, 1, step);
      }
    },
    patchStepPosition(flowVersionId: string, stepId: string, position: UIPositionData) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow || !flow.steps) {
        error(`[FLOW:PatchStep] could not find flow to patch`)
        return;
      }
      const step = flow.steps.find((s) => s.id === stepId);
      if (step) {
        step.uiPosition = position;
      }
    },
    deleteStep(flowVersionId: string, stepId: string) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow || !flow.steps) return;
      const index = flow.steps.findIndex((s) => s.id === stepId);

      if (index === -1) { return; }
      flow.steps.splice(index, 1);
    },
    patchAction(flowVersionId: string, stepId: string, action: FlowDefinitionAction) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow || !flow.steps) return;
      const step = flow.steps.find((s) => s.id === stepId);

      if (!step || !step.actions) return;

      const index = step.actions.findIndex((s) => s.id === action.id);
      if (index === -1) {
        if (!step.actions) step.actions = [];
        step.actions.push(action);
      } else {
        step.actions.splice(index, 1, action);
      }
    },
    patchActionSettingsJson(flowVersionId: string, stepId: string, actionId: string, actionSettingsJson: string) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow || !flow.steps) return;
      const step = flow.steps.find((s) => s.id === stepId);
      if (!step || !step.actions) return;
      const action = step.actions.find((s) => s.id === actionId);

      if (action) {
        action.actionSettingsJson = actionSettingsJson;
      }

    },


    patchActionIndexes(
      flowVersionId: string,
      stepId: string,
      actions: ActionWithIndex[]
    ) {
      const flow = this.flowVersion(flowVersionId);
      if (!flow || !flow.steps) return;
      const step = flow.steps.find((s) => s.id === stepId);

      if (!step || !step.actions) return;

      step.actions.forEach((action) => {
        const indexUpdate = actions.find((u) => u.actionId === action.id);
        if (indexUpdate) {
          action.index = indexUpdate.index;
        }
      });

      // now filter out all actions not in the update
      step.actions = step.actions.filter(
        (p) => actions.find((u) => u.actionId === p.id) != null
      );

      // now add missing(new) actions
      actions.forEach((update) => {
        const action = step.actions?.find((p) => p.id === update.actionId);
        if (!action) {
          this.patchAction(flowVersionId, stepId, action as unknown as FlowDefinitionAction);
        }
      });
    },
    deleteAction(flowVersionId: string, stepId: string, actionId: string) {

      const flow = this.flowVersion(flowVersionId);
      if (!flow || !flow.steps) return;
      const step = flow.steps.find((s) => s.id === stepId);
      if (!step || !step.actions) return;
      const index = step.actions.findIndex((s) => s.id === actionId);
      if (index === -1) { return; }
      step.actions.splice(index, 1);
    },



    async getLogsForFlow(id: string, versionId: string) {

      const logs = await getFlowInstanceRecentLogs(id, versionId);

      this.logSummaries = this.logSummaries || [];

      // remove existing logs for adapter
      this.logSummaries = (this.logSummaries as TickFlowInstanceLogSummary[]).filter(p => p.flowDefinitionVersionId !== versionId);

      // set new logs
      this.logSummaries = (this.logSummaries as TickFlowInstanceLogSummary[]).concat(logs);

    },
    async getLogDetails(id: string) {
      const logDetails = await getFlowInstanceLogDetails(id);
      this.logs = this.logs || [];
      this.logs = patchMetaDataList(logDetails, this.logs, maxDetailsListItems);

      return logDetails;
    },
  },
  persist: [
    {
      pick: ["flows"],
      key: PiniaStoragePath.flows,// "tick-flows",
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default useFlowStore;