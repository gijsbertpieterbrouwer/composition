import { defaultListSize, patchMetaDataList, patchMultipleInMetaDataList } from "@/helpers/arrayHelper";

import { getCommunicator, getCommunicators, updateCommunicatorDetails, updateCommunicatorFromMetaDataComponent } from "@/services/CommunicatorsService";
import {
    CommunicatorFilterOptions,
    FormValidationResponse,
    GetCommunicatorsRequest,
    GetCommunicatorsResponse,
    MetaDataComponentCommunicatorInfoData,
    TickCommunicatorSummary,
    TickCommunicatorWorkingData
} from "@/TickApi";
import { _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

export interface CommunicatorListOptions {
    //   showAssignments: boolean,
    //   showOverdueDate: boolean,
    showNote: boolean,

}

interface State {
    communicatorSummaries: TickCommunicatorSummary[];
    communicatorWorkingDatas: TickCommunicatorWorkingData[];
    listOptions: CommunicatorListOptions,
    communicatorFilters: CommunicatorFilterOptions | null;
    listResponse: GetCommunicatorsResponse | null;
    isLoading: boolean;
}

interface Getters extends _GettersTree<State> {
    getSummary: (state: State) => (id: string) => TickCommunicatorSummary | null;
}

interface Actions {
    use(filters: CommunicatorFilterOptions, isPaging: boolean): Promise<GetCommunicatorsResponse | null>;
    // addTask(request: TickCreateTaskInstanceRequest): Promise<unknown>;
    getCommunicator(id: string): Promise<TickCommunicatorWorkingData | null>;
    updateCommunicatorDetails(id: string): Promise<FormValidationResponse[]>;
    updateCommunicatorFromMetaDataComponent(ticketId: string, metadataComponentDefinitionId: string, communicatorId: string, req: MetaDataComponentCommunicatorInfoData): Promise<MetaDataComponentCommunicatorInfoData>;
    // updateTaskAssignments(request: SetTaskAssignmentsRequest): Promise<unknown>;
    patchCommunicator(serverData: TickCommunicatorWorkingData): void;
    patchCommunicatorSummary(serverData: TickCommunicatorSummary | undefined): void;
}

const useCommunicatorsStore = defineStore<"communicators", State, Getters, Actions>("communicators", {
    state: () => ({
        listResponse: null,
        isLoading: false,
        communicatorFilters: null,
        listOptions: {
            showNote: true,
        },
        //loaded: false,
        communicatorSummaries: [],
        communicatorWorkingDatas: [],
        validationResponses: [],
    }),
    getters: {
        getSummary(state) {
            return (id: string) => state.communicatorSummaries.find((p) => p.id == id) ?? null;
        },
    },
    actions: {
        async use(filters: CommunicatorFilterOptions, isPaging: boolean) {
            this.isLoading = true;
            const workspaceId = useUserStore().activeWorkspaceId ?? "";
            const current = (this.listResponse as GetCommunicatorsResponse);
            const skip = isPaging ? current.communicators?.length : null
            const take = defaultListSize;

            const req: GetCommunicatorsRequest = {
                filters: filters,
                skip: skip,
                take: take,
            }

            const serverData = await getCommunicators(workspaceId, req);
            this.isLoading = false;
            if (!serverData) { return null; }

            // paging => add to list, else => replace list
            if (!serverData.skip) {
                this.listResponse = serverData;
            } else {
                // patch
                const currentTake = current.take || 0;
                const currentSkip = current.skip || 0;
                current.skip = currentSkip; // keep original
                current.take = currentTake + (serverData?.take || 0);
                current.communicators = patchMultipleInMetaDataList(serverData.communicators, current.communicators || [], null) as TickCommunicatorSummary[];
                current.totalCount = serverData.totalCount;
            }

            // this.loaded = true;

            return serverData;
        },

        // async addTask(request: TickCreateTaskInstanceRequest): Promise<unknown> {
        //   await addTask(request);
        //   this.use();

        //   return true;
        // },
        async getCommunicator(id: string): Promise<TickCommunicatorWorkingData | null> {
            const c = await getCommunicator(id);

            if (c) {
                this.patchCommunicator(c);
                this.patchCommunicatorSummary(c.summary);

                return c;
            } else {
                return null;
            }
        },
        async updateCommunicatorDetails(id: string): Promise<FormValidationResponse[]> {

            const communicator = (this.communicatorWorkingDatas as TickCommunicatorWorkingData[]).find(
                (p) => p.id == id
            );
            if (!communicator) { return []; }
            const response = await updateCommunicatorDetails(communicator);
            if (!response.some(p => !p.isValid)) {
                const summary = this.getSummary(communicator.id) as TickCommunicatorSummary;
                if (summary != null) {
                    summary.name = communicator.name;
                    summary.avatarFileId = communicator.avatarFileId;
                    summary.color = communicator.color;

                    this.patchCommunicatorSummary(summary);
                }
            }

            return response;
        },

        async updateCommunicatorFromMetaDataComponent(ticketId: string, metadataComponentDefinitionId: string, communicatorId: string, update: MetaDataComponentCommunicatorInfoData): Promise<MetaDataComponentCommunicatorInfoData> {

            // const communicator = (this.communicatorWorkingDatas as TickCommunicatorWorkingData[]).find(
            //     (p) => p.id == id
            // );
            // if (!communicator) { return; }
            const response = await updateCommunicatorFromMetaDataComponent(ticketId, metadataComponentDefinitionId, communicatorId, update);
            if (!response?.formValidationResponse?.isValid) {
                const summary = this.getSummary(communicatorId) as TickCommunicatorSummary;
                if (summary != null) {
                    summary.name = update?.communicatorSummary?.name || summary.name;
                    summary.avatarFileId = update?.communicatorSummary?.avatarFileId;
                    summary.color = update?.communicatorSummary?.color ?? summary.color;
                    this.patchCommunicatorSummary(summary);
                }
            }




            return response;
        },

        // async updateTaskAssignments(
        //   request: SetTaskAssignmentsRequest
        // ): Promise<unknown> {
        //   const response = await updateTaskInstanceAssignments(request);
        //   return response;
        // },

        patchCommunicator(serverData: TickCommunicatorWorkingData) {
            // patch summary
            if (serverData.summary) {
                this.patchCommunicatorSummary(serverData.summary);
            }
            const index = (this.communicatorWorkingDatas as TickCommunicatorWorkingData[]).findIndex(
                (s) => s.id === serverData.id
            );
            if (index === -1) {
                this.communicatorWorkingDatas.push(serverData);
            } else {
                this.communicatorWorkingDatas.splice(index, 1, serverData);
            }
        },
        patchCommunicatorSummary(serverData: TickCommunicatorSummary | undefined) {
            if (serverData === undefined) { return; }
            this.communicatorSummaries = patchMetaDataList(serverData, this.communicatorSummaries, null);

        },
    },
    persist: [
        {
            pick: undefined,
            key: PiniaStoragePath.communicators,
            storage: getTickStorage(PiniaStorageType.Session),
        },
    ],
});

export default useCommunicatorsStore;
