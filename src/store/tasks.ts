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
} from "@/TickApi"; // Added TaskInstanceStatus import
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
  taskFilters: TaskFilterOptions | undefined;

  taskListResponse: GetTasksResponse | null;  // Allow null explicitly
  taskListResponseIsLoading: boolean;
  loaded: boolean;  // Kept, but mark as unused if not needed
  validationResponses: FormValidationResponse[];  // Restored: Assuming array of responses
}

interface Getters extends _GettersTree<State> {
  getSummary: (state: State) => (id: string) => TickTaskInstanceSummary | undefined;
  openTasksCount: (state: State) => number;
}

interface Actions {
  use(filters: TaskFilterOptions | undefined, isPaging: boolean): Promise<GetTasksResponse | undefined>;
  addTask(request: TickCreateTaskInstanceRequest): Promise<unknown>;
  getTask(id: string): Promise<TickTaskWorkingData | undefined>;
  updateTask(id: string): Promise<FormValidationResponse | undefined>;
  updateTaskAssignments(request: SetTaskAssignmentsRequest): Promise<unknown>;
  patchTask(serverData: TickTaskWorkingData): void;
  patchTaskSummary(serverData: TickTaskInstanceSummary | undefined): void;
}

const useTasksStore = defineStore<"tasks", State, Getters, Actions>("tasks", {
  state: () => ({
    taskListResponse: null,  // Now matches interface (allow null)
    taskListResponseIsLoading: false,
    taskFilters: undefined,  // Use undefined instead of null
    listOptions: {
      showAssignments: false,
      showOverdueDate: true,
      showNote: true,
    },
    loaded: false,
    taskSummaries: [],
    taskWorkingDatas: [],
    validationResponses: [],  // Restored
  }),
  getters: {
    getSummary(state) {
      return (id: string) => state.taskSummaries.find((p) => p.id === id);  // Strict ===
    },
    openTasksCount: (state) => state.taskSummaries.filter((q) => q.status === TaskInstanceStatus.Todo || q.status === TaskInstanceStatus.InProgress).length,  // Strict ===
  },
  actions: {
    async use(filters?: TaskFilterOptions, isPaging?: boolean) {
      this.taskListResponseIsLoading = true;
      try {
        const workspaceId = useUserStore().activeWorkspaceId ?? "";
        const current = this.taskListResponse;  // No cast—handle null below
        const skip = isPaging && current ? current.tasks?.length ?? 0 : 0;  // Safe chaining
        const take = defaultListSize;

        const req: GetTasksRequest = {
          filters,
          skip,
          take,
        };

        const serverData = await getTasks(workspaceId, req);
        this.taskListResponseIsLoading = false;

        if (!serverData) {
          return undefined;  // Explicit return type
        }

        // Paging: add to list; else replace
        if (!serverData.skip || !isPaging) {
          this.taskListResponse = serverData;
        } else if (current) {  // Guard against null
          const currentTake = current.take || 0;
          const currentSkip = current.skip || 0;
          current.skip = currentSkip;
          current.take = currentTake + (serverData.take || 0);
          current.tasks = patchMultipleInMetaDataList(serverData.tasks, current.tasks || [], null) as TickTaskInstanceSummary[];
          current.totalCount = serverData.totalCount;
          this.taskListResponse = current;  // Update back
        }

        this.loaded = true;
        return serverData;
      } catch (error) {
        this.taskListResponseIsLoading = false;
        console.error('Error fetching tasks:', error);  // Basic error handling
        return undefined;
      }
    },

    async addTask(request: TickCreateTaskInstanceRequest): Promise<unknown> {
      await addTask(request);
      await this.use(undefined, false);  // Refresh with no filters/paging to avoid recursion issues

      return true;
    },

    async getTask(id: string): Promise<TickTaskWorkingData | undefined> {
      const task = await getTask(id);

      if (task) {
        this.patchTask(task);
        return task;
      }

      return undefined;
    },

    async updateTask(id: string): Promise<FormValidationResponse | undefined> {
      const task = this.taskWorkingDatas.find((p) => p.taskInstanceId === id);  // Strict ===
      if (!task) {
        return undefined;
      }

      const response = await updateTask(task.taskInstanceId, task);

      if (response?.isValid && response.isFinalizingTask) {  // Safe chaining
        task.summary = response.summary ?? task.summary;
        await this.use(undefined, false);  // Refresh
      }

      return response;
    },

    async updateTaskAssignments(request: SetTaskAssignmentsRequest): Promise<unknown> {
      const response = await updateTaskInstanceAssignments(request);
      return response;
    },

    patchTask(serverData: TickTaskWorkingData) {
      this.patchTaskSummary(serverData.summary);

      const index = this.taskWorkingDatas.findIndex((s) => s.taskInstanceId === serverData.taskInstanceId);  // Strict ===
      if (index === -1) {
        this.taskWorkingDatas.push(serverData);
      } else {
        this.taskWorkingDatas.splice(index, 1, serverData);
      }
    },

    patchTaskSummary(serverData: TickTaskInstanceSummary | undefined) {
      if (serverData) {
        this.taskSummaries = patchMetaDataList(serverData, this.taskSummaries, null);
      }
    },
  },
  persist: [
    {
      pick: undefined,  // Persists all—fine, but specify keys if needed (e.g., ['taskSummaries'])
      key: PiniaStoragePath.tasks,
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default useTasksStore;