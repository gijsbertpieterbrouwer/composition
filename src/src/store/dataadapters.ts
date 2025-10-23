import { _ActionsTree, _GettersTree, defineStore } from "pinia";

import { maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import {
  createAdapter,
  deleteAdapter,
  getAdapterLogDetails,
  getAdapterRecentLogs,
  getDetails,
  tryAdapter,
  updateAdapter,
} from "@/services/DataAdaptersService";
import {
  ApiAdapterExecutionLog,
  ObjectRemovalProgress,
  RemovalStatus,
  TickApiAdapterDefinition,
  TickApiAdapterLog,
  TickApiAdapterLogSummary,
} from "@/TickApi";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

interface State {
  adapters: TickApiAdapterDefinition[];
  tryLogs: ApiAdapterExecutionLog[]; // one per definition
  tryRequests: string[]; // one per definition

  logSummaries: TickApiAdapterLogSummary[];
  logs: TickApiAdapterLog[];
}

interface Getters extends _GettersTree<State> {
  all(state: State): TickApiAdapterDefinition[];
  //activeAdapter: (state: State) => ApiAdapterDefinition | undefined;
  getTryLog: (state: State) => (definitionId: string) => ApiAdapterExecutionLog;
  isBusyOnTry: (state: State) => (definitionId: string) => boolean;

  adapterLogs: (state: State) => (definitionId: string) => TickApiAdapterLogSummary[];
  adapterLogDetails: (state: State) => (logId: string) => TickApiAdapterLog;
}

interface Actions extends _ActionsTree {
  use(): void;
  get(id: string): Promise<TickApiAdapterDefinition>;
  add(collectionId?: string, name?: string, copyOfId?: string): Promise<string>;
  save(id: string): Promise<TickApiAdapterDefinition>;
  delete(id: string): Promise<ObjectRemovalProgress>;
  storeTryLog(log: ApiAdapterExecutionLog): void;
  executeTry(def: TickApiAdapterDefinition): void;
  removeTryLog(id: string): void;

  getLogsForAdapter(id: string): void;
  getLogDetails(id: string): void;
}

const useDataAdaptersStore = defineStore<
  "dataadapters",
  State,
  Getters,
  Actions
>("dataadapters", {
  state: () => ({
    activeId: "",
    adapters: [],
    activeLoaded: false,
    tryLogs: [],
    tryRequests: [],
    logSummaries: [],
    logs: null,
  }),
  getters: {
    all: (state) => state.adapters,
    getTryLog: (state) => (definitionId: string) =>
      state.tryLogs.find(
        (p) => p.apiAdapterDefinitionId == definitionId
      ) as ApiAdapterExecutionLog,
    isBusyOnTry: (state) => (definitionId: string) => state.tryRequests.some((p) => p == definitionId) as boolean,

    adapterLogs: (state) => (definitionId: string) => (state.logSummaries || []).filter((p) => p.adapterDefinitionId == definitionId),
    adapterLogDetails: (state) => (logId: string) => (state.logs || []).find((p) => p.id == logId),
  },
  actions: {
    async delete(id) {
      const progress = await deleteAdapter(id);

      if (progress.removalStatus != RemovalStatus.Failed) {
        this.removeTryLog(id);

        const item = (this.adapters as TickApiAdapterDefinition[]).find(
          (f) => f.id === id
        ) as TickApiAdapterDefinition;
        if (item) {
          item.deleted = true;
        }
      }

      return progress;
    },
    async use() {
      this.loaded = true;
    },
    async getLogsForAdapter(id: string) {

      const adapterLogs = await getAdapterRecentLogs(id);

      this.logSummaries = this.logSummaries || [];

      // remove existing logs for adapter
      this.logSummaries = (this.logSummaries as TickApiAdapterLogSummary[]).filter(p => p.adapterDefinitionId != id);

      // set new logs
      this.logSummaries = (this.logSummaries as TickApiAdapterLogSummary[]).concat(adapterLogs);

    },
    async getLogDetails(id: string) {
      const adapterLogDetails = await getAdapterLogDetails(id);
      this.logs = this.logs || [];
      this.logs = patchMetaDataList(adapterLogDetails, this.logs, maxDetailsListItems);
    },
    async save(id: string): Promise<TickApiAdapterDefinition> {
      const item = (this.adapters as TickApiAdapterDefinition[]).find(
        (f) => f.id === id
      ) as TickApiAdapterDefinition;
      return await updateAdapter(item);
    },
    async removeTryLog(id: string) {
      const existingItemIndex = (
        this.tryLogs as ApiAdapterExecutionLog[]
      ).findIndex((p) => p.apiAdapterDefinitionId == id);

      if (existingItemIndex != -1) {
        this.tryLogs.splice(existingItemIndex, 1);
      }

      //remove existing try request
      const existingRequestItemIndex = (this.tryRequests as string[]).findIndex(
        (p) => p == id
      );
      if (existingRequestItemIndex != -1) {
        this.tryRequests.splice(existingRequestItemIndex, 1);
      }
    },
    async executeTry(def: TickApiAdapterDefinition) {
      this.removeTryLog(def.id);

      this.tryRequests.push(def.id);

      tryAdapter(def);
    },
    async storeTryLog(log: ApiAdapterExecutionLog) {
      // update definition sample data
      if (log.success) {
        const adapter = (this.adapters as TickApiAdapterDefinition[]).find(
          (p) => p.id == log.apiAdapterDefinitionId
        ) as TickApiAdapterDefinition;
        adapter.sampleData = log.responseDataJson;
      }

      const existingItemIndex = (
        this.tryLogs as ApiAdapterExecutionLog[]
      ).findIndex(
        (p) => p.apiAdapterDefinitionId == log.apiAdapterDefinitionId
      );

      if (existingItemIndex === -1) {
        this.tryLogs.push(log);
      } else {
        this.tryLogs.splice(existingItemIndex, 1, log);
      }

      //remove existing try request
      const existingRequestItemIndex = (this.tryRequests as string[]).findIndex(
        (p) => p == log.apiAdapterDefinitionId
      );
      if (existingRequestItemIndex != -1) {
        this.tryRequests.splice(existingRequestItemIndex, 1);
      }
    },
    async add(collectionId?: string, name?: string, copyOfId?: string): Promise<string> {
      const item: TickApiAdapterDefinition = await createAdapter(useUserStore().activeWorkspaceId, collectionId, name, copyOfId);
      this.adapters.push(item);
      return item.id;
    },
    async get(id): Promise<TickApiAdapterDefinition> {
      this.activeLoaded = false;
      this.activeId = id;

      if (!id) {
        return;
      }

      const serverData = await getDetails(this.activeId);
      this.patch(serverData);

      this.activeLoaded = true;

      return serverData;
    },
    patch(serverData: TickApiAdapterDefinition) {
      this.adapters = patchMetaDataList(serverData, this.adapters, maxDetailsListItems);
    },
  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.dataadapters,// "tick-dataadapters",
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default useDataAdaptersStore;
