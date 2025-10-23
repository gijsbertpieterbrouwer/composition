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
  executionEnvironment: (state: State) => (id: string) => ExecutionEnvironmentMetaDataItem;
  adapter: (state: State) => (id: string) => MetaDataItem;
  cannedResponse: (state: State) => (id: string) => MetaDataItem;
  label: (state: State) => (id: string) => TickLabelDefinition;
  team: (state: State) => (id: string) => TeamSummary;
  user: (state: State) => (id: string) => UserSummary;
  bot: (state: State) => (id: string) => UserSummary;
  flow: (state: State) => (id: string) => TickFlowDefinitionSummary;
  communicationChannel: (state: State) => (id: string) => TickChannelSummary;
  task: (state: State) => (id: string) => TickTaskDefinitionSummary;

  sla: (state: State) => (id: string) => MetaDataItem;
  workspaceFile: (state: State) => (id: string) => WorkspaceFileSummary;
  verifiedInternetDomainSummary: (state: State) => (id: string) => TickVerifiedInternetDomainSummary;
  communicatorCategoryDefinition: (state: State) => (id: string) => TickCommunicatorCategoryDefinitionSummary;
  urlIsWithinVerifiedDomain: (state: State) => (url: string) => boolean;

  dashboard: (state: State) => (id: string) => TickDashboard;
  databagItem: (state: State) => (id: string) => DatabagItemDefinitionSummary;
}

interface Actions extends _ActionsTree {
  use(workspaceId?: string): void;
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
    },
    loaded: false,
  }),
  getters: {
    communicatorCategoryDefinition: (state) => (id: string) => state.utilityData.communicatorCategoryDefinitions.find((f) => f.id === id) as TickCommunicatorCategoryDefinitionSummary,
    verifiedInternetDomainSummary: (state) => (id: string) => state.utilityData.verifiedDomains.find((f) => f.id === id) as TickVerifiedInternetDomainSummary,
    executionEnvironment: (state) => (id: string) => state.utilityData.executionEnvironments.find((f) => f.id === id) as ExecutionEnvironmentMetaDataItem,
    adapter: (state) => (id: string) => state.utilityData.adapterDefinitions.find((f) => f.id === id) as MetaDataItem,
    cannedResponse: (state) => (id: string) => state.utilityData.cannedResponseDefinitions.find((f) => f.id === id) as MetaDataItem,
    label: (state) => (id: string) => state.utilityData.labelDefinitions.find((f) => f.id === id) as TickLabelDefinition,
    team: (state) => (id: string) => state.utilityData.teams.find((f) => f.id === id) as TeamSummary,
    user: (state) => (id: string) => state.utilityData.users.find((f) => f.id === id) as UserSummary,
    bot: (state) => (id: string) => state.utilityData.users.find((f) => f.id === id) as UserSummary,
    flow: (state) => (id: string) => state.utilityData.flowDefinitions.find((f) => f.id === id) as TickFlowDefinitionSummary,
    communicationChannel: (state) => (id: string) => state.utilityData.communicationChannels.find((f) => f.id === id) as TickChannelSummary,
    task: (state) => (id: string) => state.utilityData.taskDefinitions.find((f) => f.id === id) as TickTaskDefinitionSummary,
    sla: (state) => (id: string) => state.utilityData.slaDefinitions.find((f) => f.id === id) as MetaDataItem,
    workspaceFile: (state) => (id: string) => state.utilityData.files.find((f) => f.id === id) as WorkspaceFileSummary,
    dashboard: (state) => (id: string) => state.utilityData.dashboardDefinitions.find((f) => f.id === id) as TickDashboard,
    databagItem: (state) => (id: string) => state.utilityData.databagItemDefinitions.find((f) => f.id === id) as DatabagItemDefinitionSummary,

    urlIsWithinVerifiedDomain(state) {
      const domains = state.utilityData.verifiedDomains || [];
      return (url: string) => {
        const requestedHostName = getHostNameFromUrl(url);
        return domains.some(p => requestedHostName.endsWith(p.domainName));
      }
    },

  },
  actions: {
    async use(workspaceId?: string) {
      if (!workspaceId) { workspaceId = useUserStore().activeWorkspaceId; }

      if (!workspaceId) {
        return;
      }

      const newData = await GetUtilityData(workspaceId);
      this.utilityData = newData;
      this.loaded = true;

    },
    patchDashboardDefinition(update: TickDashboard) {
      // debug("Patching dashboard definition data");
      this.utilityData.dashboardDefinitions = patchMetaDataList(update, this.utilityData.dashboardDefinitions, null);
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
