import { defaultListSize, patchMetaDataList, patchMultipleInMetaDataList } from "@/helpers/arrayHelper";
import {
  addTask,
  getTask,
  getTasks,
  updateTask,
  updateTaskInstanceAssignments
} from "@/services/TasksService";
import {
  FormValidationResponse,
  GetTasksRequest,
  GetTasksResponse,
  SetTaskAssignmentsRequest,
  TaskFilterOptions,
  TaskInstanceStatus,
  TickCreateTaskInstanceRequest,
  TickTaskInstanceSummary,
  TickTaskWorkingData
} from "@/TickApi";
import { _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

export interface TaskListOptions {
  showAssignments: boolean,
  showOverdueDate: boolean,
  showNote: boolean,

}

interface State {
  taskSummaries: TickTaskInstanceSummary[];
  taskWorkingDatas: TickTaskWorkingData[];

  listOptions: TaskListOptions,
  taskFilters: TaskFilterOptions;

  taskListResponse: GetTasksResponse;
  taskListResponseIsLoading: boolean;
}

interface Getters extends _GettersTree<State> {
  getSummary: (state: State) => (id: string) => TickTaskInstanceSummary;
  openTasksCount: (state: State) => number;
}

interface Actions {
  use(filters: TaskFilterOptions, isPaging: boolean): Promise<GetTasksResponse>;
  addTask(request: TickCreateTaskInstanceRequest): Promise<unknown>;
  getTask(id: string): Promise<TickTaskWorkingData>;
  updateTask(id: string): Promise<FormValidationResponse>;
  updateTaskAssignments(request: SetTaskAssignmentsRequest): Promise<unknown>;
  patchTask(serverData: TickTaskWorkingData): void;
  patchTaskSummary(serverData: TickTaskInstanceSummary): void;
}

const useTasksStore = defineStore<"tasks", State, Getters, Actions>("tasks", {
  state: () => ({
    taskListResponse: null,
    taskListResponseIsLoading: false,
    taskFilters: null,
    listOptions: {
      showAssignments: false,
      showOverdueDate: true,
      showNote: true,
    },
    loaded: false,
    taskSummaries: [],
    taskWorkingDatas: [],
    validationResponses: [],
  }),
  getters: {
    getSummary(state) {
      return (id: string) => state.taskSummaries.find((p) => p.id == id);
    },
    openTasksCount: (state) => state.taskSummaries.filter((q) => q.status == TaskInstanceStatus.Todo || q.status == TaskInstanceStatus.InProgress).length,
  },
  actions: {
    async use(filters?: TaskFilterOptions, isPaging?: boolean) {
      this.taskListResponseIsLoading = true;
      const workspaceId = useUserStore().activeWorkspaceId;
      const current = (this.taskListResponse as GetTasksResponse);
      const skip = isPaging ? current.tasks?.length : null
      const take = defaultListSize;

      const req: GetTasksRequest = {
        filters: filters,
        skip: skip,
        take: take,
      }


      const serverData = await getTasks(workspaceId, req);
      this.taskListResponseIsLoading = false;
      if (!serverData) { return; }

      // paging => add to list, else => replace list
      if (!serverData.skip) {
        this.taskListResponse = serverData;
      } else {
        // patch 

        const currentTake = current.take || 0;
        const currentSkip = current.skip || 0;
        current.skip = currentSkip; // keep original
        current.take = currentTake + (serverData?.take || 0);
        current.tasks = patchMultipleInMetaDataList(serverData.tasks, current.tasks || [], null) as TickTaskInstanceSummary[];
        current.totalCount = serverData.totalCount;

      }

      this.loaded = true;

      return serverData;
    },
    // async use() {
    //   const tasks = await getTasks(useUserStore().activeWorkspaceId);
    //   this.taskSummaries = tasks;
    // },

    async addTask(request: TickCreateTaskInstanceRequest): Promise<unknown> {
      await addTask(request);
      this.use();

      return true;
    },
    async getTask(id: string): Promise<TickTaskWorkingData> {
      const task = await getTask(id);

      if (task) {
        this.patchTask(task);
        return task;
      }
    },
    async updateTask(id: string): Promise<FormValidationResponse> {
      const task = (this.taskWorkingDatas as TickTaskWorkingData[]).find(
        (p) => p.taskInstanceId == id
      );
      if (!task) {
        return;
      }

      const response = await updateTask(task.taskInstanceId, task);

      if (response.isValid && response.isFinalizingTask) {
        // update open tasks
        task.summary = response?.summary ?? task.summary;

        this.use();
      }

      return response;
    },
    async updateTaskAssignments(
      request: SetTaskAssignmentsRequest
    ): Promise<unknown> {
      const response = await updateTaskInstanceAssignments(request);
      return response;
    },

    patchTask(serverData: TickTaskWorkingData) {
      // patch summary
      this.patchTaskSummary(serverData.summary);

      const index = (this.taskWorkingDatas as TickTaskWorkingData[]).findIndex(
        (s) => s.taskInstanceId === serverData.taskInstanceId
      );
      if (index === -1) {
        this.taskWorkingDatas.push(serverData);
      } else {
        this.taskWorkingDatas.splice(index, 1, serverData);
      }
    },
    patchTaskSummary(serverData: TickTaskInstanceSummary) {
      this.taskSummaries = patchMetaDataList(serverData, this.taskSummaries, null);

    },
  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.tasks,// "tick-tasks",
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default useTasksStore;
