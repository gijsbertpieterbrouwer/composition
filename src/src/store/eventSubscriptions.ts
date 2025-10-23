import { _ActionsTree, _GettersTree, defineStore } from "pinia";

import { maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import { createEventSubscription, deleteEventSubscription, getAllEventSubscription, getEventSubscriptionDetails, updateEventSubscription } from "@/services/EventSubscriptionsService";
import {
  TickEventSubscription,
  TickEventSubscriptionSummary,
} from "@/TickApi";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

interface State {
  eventSubscriptions: TickEventSubscription[];
  eventSubscriptionSummaries: TickEventSubscriptionSummary[];

}

interface Getters extends _GettersTree<State> {
  all(state: State): TickEventSubscription[];
  getEventSubscription: (state: State) => (id: string) => TickEventSubscription;
}

interface Actions extends _ActionsTree {
  use(): void;
  get(id: string): Promise<TickEventSubscription>;
  add(): Promise<string>;
  save(id: string): Promise<TickEventSubscription>;
  delete(id: string): Promise<unknown>;
}

const useEventSubscriptionsStore = defineStore<
  "eventSubscriptions",
  State,
  Getters,
  Actions
>("eventSubscriptions", {
  state: () => ({
    eventSubscriptions: [],
    eventSubscriptionSummaries: [],
  }),
  getters: {
    all: (state) => state.eventSubscriptions,

    getEventSubscription(state) {
      return (id: string) => state.eventSubscriptions.find((p) => p.id == id);
    },
  },
  actions: {
    async delete(id) {
      await deleteEventSubscription(id);

      const indexSummary = (this.eventSubscriptions as TickEventSubscription[]).findIndex(
        (s) => s.id === id
      );
      if (indexSummary > -1) {
        this.eventSubscriptions.splice(indexSummary, 1);
      }

      return true;
    },
    async use() {
      const all = await getAllEventSubscription(useUserStore().activeWorkspaceId);

      this.eventSubscriptionSummaries = all;
    },
    async save(id: string): Promise<TickEventSubscription> {
      const item = (this.eventSubscriptions as TickEventSubscription[]).find(
        (f) => f.id === id
      ) as TickEventSubscription;
      return await updateEventSubscription(item);
    },


    async add() {
      const item: TickEventSubscription = await createEventSubscription(useUserStore().activeWorkspaceId);
      this.patch(item);

      return item.id;
    },
    async get(id): Promise<TickEventSubscription> {
      if (!id) { return; }

      const serverData = await getEventSubscriptionDetails(id);
      this.patch(serverData);

      return serverData;
    },
    patch(serverData: TickEventSubscription) {
      this.eventSubscriptions = patchMetaDataList(serverData, this.eventSubscriptions, maxDetailsListItems);
    },
  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.eventsubscriptions,// "tick-eventsubscriptions",
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default useEventSubscriptionsStore;
