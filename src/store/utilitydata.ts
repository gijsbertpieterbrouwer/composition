import { DatabagItemDefinitionSummary, ExecutionEnvironmentMetaDataItem, MetaDataItem, TeamSummary, TickChannelSummary, TickCommunicatorCategoryDefinitionSummary, TickDashboard, TickFlowDefinitionSummary, TickLabelDefinition, TickTaskDefinitionSummary, TickVerifiedInternetDomainSummary, TickWorkspaceUtilityData, UserSummary, WorkspaceFileSummary } from "@/TickApi";
import { patchMetaDataList, patchMultipleInMetaDataList } from "@/helpers/arrayHelper";
import { getHostNameFromUrl } from "@/helpers/stringHelper";
import { debug } from "@/log";
import { GetUtilityData } from "@/services/WorkspaceService";
import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";


interface State {
  utilityData: TickWorkspaceUtilityData
  loaded: boolean
}

interface Getters extends _GettersTree<State> {
  executionEnvironment: (state: State) => (id: string) => ExecutionEnvironmentMetaDataItem | null;
  adapter: (state: State) => (id: string) => MetaDataItem | null;
  cannedResponse: (state: State) => (id: string) => MetaDataItem | null;
  label: (state: State) => (id: string) => TickLabelDefinition | null;
  team: (state: State) => (id: string) => TeamSummary | null;
  user: (state: State) => (id: string) => UserSummary | null;
  bot: (state: State) => (id: string) => UserSummary | null;
  flow: (state: State) => (id: string) => TickFlowDefinitionSummary | null;
  communicationChannel: (state: State) => (id: string) => TickChannelSummary | null;
  task: (state: State) => (id: string) => TickTaskDefinitionSummary | null;

  sla: (state: State) => (id: string) => MetaDataItem | null;
  workspaceFile: (state: State) => (id: string) => WorkspaceFileSummary | null;
  verifiedInternetDomainSummary: (state: State) => (id: string) => TickVerifiedInternetDomainSummary | null;
  communicatorCategoryDefinition: (state: State) => (id: string) => TickCommunicatorCategoryDefinitionSummary | null;
  urlIsWithinVerifiedDomain: (state: State) => (url: string) => boolean;

  dashboard: (state: State) => (id: string | null) => TickDashboard | null;
  databagItem: (state: State) => (id: string) => DatabagItemDefinitionSummary | null;
}

interface Actions extends _ActionsTree {
  use(workspaceId?: string | null): Promise<void>;
  patch(update: TickWorkspaceUtilityData): void;
  patchDashboardDefinition(update: TickDashboard): void;
}

const useUtilityDataStore = defineStore<"utilitydata", State, Getters, Actions>("utilitydata", {
  state: () => ({
    utilityData: {
      adapterDefinitions: [],
      //bots: [],
      flowDefinitions: [],
      labelDefinitions: [],
      teams: [],
      users: [],
      executionEnvironments: [],
      communicationChannels: [],
      files: [],
      taskDefinitions: [],
      slaDefinitions: [],
      cannedResponseDefinitions: [],
      dashboardDefinitions: [],
      verifiedDomains: [],
      databagItemDefinitions: [],
      knowledgeBases: [],
      communicatorCategoryDefinitions: [],
    },
    loaded: false,
  }),
  getters: {
    communicatorCategoryDefinition: (state) => (id: string) => state.utilityData.communicatorCategoryDefinitions?.find((f) => f.id === id) ?? null,
    verifiedInternetDomainSummary: (state) => (id: string) => state.utilityData.verifiedDomains?.find((f) => f.id === id) ?? null,
    executionEnvironment: (state) => (id: string) => state.utilityData.executionEnvironments?.find((f) => f.id === id) ?? null,
    adapter: (state) => (id: string) => state.utilityData.adapterDefinitions?.find((f) => f.id === id) ?? null,
    cannedResponse: (state) => (id: string) => state.utilityData.cannedResponseDefinitions?.find((f) => f.id === id) ?? null,
    label: (state) => (id: string) => state.utilityData.labelDefinitions?.find((f) => f.id === id) ?? null,
    team: (state) => (id: string) => state.utilityData.teams?.find((f) => f.id === id) ?? null,
    user: (state) => (id: string) => state.utilityData.users?.find((f) => f.id === id) ?? null,
    bot: (state) => (id: string) => state.utilityData.users?.find((f) => f.id === id) ?? null,
    flow: (state) => (id: string) => state.utilityData.flowDefinitions?.find((f) => f.id === id) ?? null,
    communicationChannel: (state) => (id: string) => state.utilityData.communicationChannels?.find((f) => f.id === id) ?? null,
    task: (state) => (id: string) => state.utilityData.taskDefinitions?.find((f) => f.id === id) ?? null,
    sla: (state) => (id: string) => state.utilityData.slaDefinitions?.find((f) => f.id === id) ?? null,
    workspaceFile: (state) => (id: string) => state.utilityData.files?.find((f) => f.id === id) ?? null,
    dashboard: (state) => (id: string | null) => state.utilityData.dashboardDefinitions?.find((f) => f.id === id) ?? null,
    databagItem: (state) => (id: string) => state.utilityData.databagItemDefinitions?.find((f) => f.id === id) ?? null,

    urlIsWithinVerifiedDomain(state) {
      const domains = state.utilityData.verifiedDomains || [];
      return (url: string) => {
        const requestedHostName = getHostNameFromUrl(url);
        return domains.some(p => requestedHostName.endsWith(p.domainName));
      }
    },

  },
  actions: {
    async use(workspaceId?: string | null) {
      if (!workspaceId) { workspaceId = useUserStore().activeWorkspaceId; }

      if (!workspaceId) {
        return;
      }

      const newData = await GetUtilityData(workspaceId);
      if (newData) {
        this.utilityData = newData;
        this.loaded = true;
      }
    },
    patchDashboardDefinition(update: TickDashboard) {
      // debug("Patching dashboard definition data");
      this.utilityData.dashboardDefinitions = patchMetaDataList(update, this.utilityData?.dashboardDefinitions, null);
    },
    patch(update: TickWorkspaceUtilityData) {
      debug("Patching utility data");

      this.utilityData.users = patchMultipleInMetaDataList(update.users, this.utilityData.users, null);
      this.utilityData.teams = patchMultipleInMetaDataList(update.teams, this.utilityData.teams, null);
      this.utilityData.labelDefinitions = patchMultipleInMetaDataList(update.labelDefinitions, this.utilityData.labelDefinitions, null);
      this.utilityData.flowDefinitions = patchMultipleInMetaDataList(update.flowDefinitions, this.utilityData.flowDefinitions, null);
      this.utilityData.adapterDefinitions = patchMultipleInMetaDataList(update.adapterDefinitions, this.utilityData.adapterDefinitions, null);
      this.utilityData.communicationChannels = patchMultipleInMetaDataList(update.communicationChannels, this.utilityData.communicationChannels, null);
      this.utilityData.files = patchMultipleInMetaDataList(update.files, this.utilityData.files, null);
      this.utilityData.executionEnvironments = patchMultipleInMetaDataList(update.executionEnvironments, this.utilityData.executionEnvironments, null);
      this.utilityData.taskDefinitions = patchMultipleInMetaDataList(update.taskDefinitions, this.utilityData.taskDefinitions, null);
      this.utilityData.slaDefinitions = patchMultipleInMetaDataList(update.slaDefinitions, this.utilityData.slaDefinitions, null);
      this.utilityData.cannedResponseDefinitions = patchMultipleInMetaDataList(update.cannedResponseDefinitions, this.utilityData.cannedResponseDefinitions, null);
      this.utilityData.dashboardDefinitions = patchMultipleInMetaDataList(update.dashboardDefinitions, this.utilityData.dashboardDefinitions, null);
      this.utilityData.verifiedDomains = patchMultipleInMetaDataList(update.verifiedDomains, this.utilityData.verifiedDomains, null);
      this.utilityData.knowledgeBases = patchMultipleInMetaDataList(update.knowledgeBases, this.utilityData.knowledgeBases, null);
      this.utilityData.databagItemDefinitions = patchMultipleInMetaDataList(update.databagItemDefinitions, this.utilityData.databagItemDefinitions, null);
      this.utilityData.communicatorCategoryDefinitions = patchMultipleInMetaDataList(update.communicatorCategoryDefinitions, this.utilityData.communicatorCategoryDefinitions, null);
    },
  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.utilitydata,// "tick-utilitydata",
      storage: getTickStorage(PiniaStorageType.Local),
    },
  ]
});

export default useUtilityDataStore;