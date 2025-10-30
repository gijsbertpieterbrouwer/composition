import { CreateDashboardsRequest, DashboardDataRequest, DashboardDataResponse, DashboardTemplateType, GetDashboardsRequest, GetStatisticDefinitionsRequest, TickDashboard, TickDashboardSummary, TickStatDefinition, } from "@/TickApi";
import { patchMultipleInMetaDataList } from "@/helpers/arrayHelper";
import { GetDashboardDataFromServer, createDashboard, deleteDashboard, getDashboardStatisticdefinitions, getDashboards, updateDashboard, updateWorkspaceDefaultDashboard } from "@/services/StatisticsService";
import { _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";
import useUtilityDataStore from "./utilitydata";

interface State {
  dashboardDatas: DashboardDataResponse[];
  dashboardSummaries: TickDashboardSummary[];
  dashboardStatisticDefinitions: TickStatDefinition[];

}

interface Getters extends _GettersTree<State> {
  dashboardData: (state: State) => (id: string) => DashboardDataResponse | undefined;
  dashboardTileData: (state: State) => (dashboardId: string, tileId: string) => any;
}

interface Actions {
  use(): Promise<void>;
  useEditor(): Promise<void>;
  getDashboardData(request: DashboardDataRequest): Promise<boolean>;
  patchDashboardData(serverData: DashboardDataResponse): void;
  createDashboard(template: DashboardTemplateType): Promise<TickDashboard>;
  saveDashboard(id: string): Promise<unknown>;
  deleteDashboard(id: string): Promise<unknown>;
  setDashboardAsWorkspaceDefault(id: string): Promise<boolean>;
}

const useDashboardsStore = defineStore<"dashboardDatas", State, Getters, Actions>("dashboardDatas", {
  state: () => ({
    dashboardDatas: [],
    dashboardSummaries: [],
    dashboardStatisticDefinitions: [],
  }),
  getters: {
    dashboardData(state) {
      return (dashboardId: string) => state.dashboardDatas.find((p) => p.id === dashboardId);
    },
    dashboardTileData(state) {
      return (dashboardId: string, tileId: string) => {
        const dashboard = state.dashboardDatas?.find((p) => p.id === dashboardId);
        if (!dashboard) { return null; }

        const chartTileData = dashboard.chartTiles?.find(p => p.id === tileId);
        if (chartTileData) { return chartTileData; }

        const counterTileData = dashboard.counterTiles?.find(p => p.id === tileId);
        if (counterTileData) { return counterTileData; }

        const pieTileData = dashboard.pieTiles?.find(p => p.id === tileId);
        if (pieTileData) { return pieTileData; }

        const messageboardTileData = dashboard.messageboardTiles?.find(p => p.id === tileId);
        if (messageboardTileData) { return messageboardTileData; }

        const heatmapdTileData = dashboard.heatmapTiles?.find(p => p.id === tileId);
        if (heatmapdTileData) { return heatmapdTileData; }
        return null;

      };
    },

  },
  actions: {
    async use() {

      const request: GetDashboardsRequest = {
        workspaceId: useUserStore().activeWorkspaceId ?? "",
      }
      const serverData = await getDashboards(request);
      this.dashboardSummaries = serverData;
    },
    async useEditor() {

      const request: GetStatisticDefinitionsRequest = {
        workspaceId: useUserStore().activeWorkspaceId ?? "",
      }
      const serverData = await getDashboardStatisticdefinitions(request);
      this.dashboardStatisticDefinitions = serverData.statistics || [];
    },

    async getDashboardData(request: DashboardDataRequest): Promise<boolean> {
      //return on empty request
      if (!request.charts?.length && !request.counters?.length
        && !request.pies?.length && !request.messageboards?.length
        && !request.heatmaps?.length
      ) {
        return false;
      }

      const serverData = await GetDashboardDataFromServer(request);
      if (serverData) {
        this.patchDashboardData(serverData);
      }
      return true;

    },

    async createDashboard(template: DashboardTemplateType): Promise<TickDashboard> {
      const request: CreateDashboardsRequest = {
        workspaceId: useUserStore().activeWorkspaceId ?? "",
        useTemplateType: template,
      }

      const serverData = await createDashboard(request);
      useUtilityDataStore().patchDashboardDefinition(serverData);

      this.use();
      return serverData;
    },
    async saveDashboard(id: string): Promise<unknown> {
      if (!id) { return; }
      const def = useUtilityDataStore().dashboard(id);
      if (!def) { return; }

      const summary = (this.dashboardSummaries as TickDashboardSummary[]).find(p => p.id === id);
      if (summary) {
        summary.name = def.name;
      }

      const serverData = await updateDashboard(def);

      useUtilityDataStore().patchDashboardDefinition(serverData);

      return true;
    },
    async deleteDashboard(id: string): Promise<unknown> {
      if (!id) { return; }
      const def = useUtilityDataStore().dashboard(id);
      if (!def) { return; }

      await deleteDashboard({
        workspaceId: useUserStore().activeWorkspaceId ?? "",
        id: id,
      });

      this.dashboardSummaries = (this.dashboardSummaries as TickDashboardSummary[]).filter(p => p.id !== id);
      return true;
    },
    async setDashboardAsWorkspaceDefault(id: string): Promise<boolean> {
      if (!id) { return false; }
      const def = useUtilityDataStore().dashboard(id);
      if (!def) { return false; }

      await updateWorkspaceDefaultDashboard(
        useUserStore()?.activeWorkspaceId ?? "",
        id,
      );

      const ws = useUserStore().activeWorkspace;
      if (ws) {
        ws.defaultDashboardId = id;
      }

      return true;
    },
    patchDashboardData(serverData: DashboardDataResponse) {
      if (!serverData) { return; }
      const dashboardDataToUpdate = (this.dashboardDatas as DashboardDataResponse[]).find((p) => p.id === serverData.id)
      if (dashboardDataToUpdate) {
        dashboardDataToUpdate.chartTiles = patchMultipleInMetaDataList(serverData.chartTiles, dashboardDataToUpdate.chartTiles, null);
        dashboardDataToUpdate.counterTiles = patchMultipleInMetaDataList(serverData.counterTiles, dashboardDataToUpdate.counterTiles, null);
        dashboardDataToUpdate.pieTiles = patchMultipleInMetaDataList(serverData.pieTiles, dashboardDataToUpdate.pieTiles, null);
        dashboardDataToUpdate.messageboardTiles = patchMultipleInMetaDataList(serverData.messageboardTiles, dashboardDataToUpdate.messageboardTiles, null);
        dashboardDataToUpdate.heatmapTiles = patchMultipleInMetaDataList(serverData.heatmapTiles, dashboardDataToUpdate.heatmapTiles, null);
      } else {
        this.dashboardDatas.push(serverData);
      }
    },

  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.dashboards,// "tick-dashboards",
      storage: getTickStorage(PiniaStorageType.Local),
    },
  ],
});

export default useDashboardsStore;