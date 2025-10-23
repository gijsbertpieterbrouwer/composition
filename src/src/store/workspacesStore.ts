import {
  TickWorkspace
} from "@/TickApi";
import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { addWorkspace } from "../services/WorkspaceService";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";
interface State {
  something: string;
  // subscription: TickSubScriptionData;
  // currentPeriodUsage: BillingPeriodData;
  // invoices: TickInvoice[];
  // billingInfo: TickBillingInfo;
}

interface Getters extends _GettersTree<State> {
  all(state: State): unknown;
}

interface Actions extends _ActionsTree {
  createWorkspace(name: string): Promise<TickWorkspace>;

}

const useWorkspacesStore = defineStore<
  "workspaces",
  State,
  Getters,
  Actions
>("workspaces", {
  state: () => ({
    something: "",
  }),
  getters: {
    all: (state) => state.something,
  },
  actions: {
    async createWorkspace(name: string) {
      const ws = await addWorkspace({
        name: name
      });

      // add to user store
      useUserStore().workspaces.push(ws);

      return ws;
    },


  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.workspaces,
      storage: getTickStorage(PiniaStorageType.Session, true),
    },
  ],
});

export default useWorkspacesStore;
