import { _ActionsTree, _GettersTree, defineStore } from "pinia";

import { maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import {
  getDatabags,
  getDetails,
  updateDataBag,
} from "@/services/DatabagsService";
import { TickDataBag, TickDataBagSummary } from "@/TickApi";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

interface State {
  summaries: TickDataBagSummary[];
  databags: TickDataBag[];
}

interface Getters extends _GettersTree<State> {
  all(state: State): TickDataBagSummary[];
}

interface Actions extends _ActionsTree {
  use(): void;
  get(id: string): Promise<TickDataBag | null>;
  save(id: string): Promise<TickDataBag>;
}

const useDataBagsStore = defineStore<"databags", State, Getters, Actions>(
  "databags",
  {
    state: () => ({
      summaries: [],
      databags: [],
      loaded: false,
    }),
    getters: {
      all: (state) => state.summaries,
    },
    actions: {
      async use() {
        const summaries = await getDatabags(useUserStore().activeWorkspaceId ?? "");
        this.summaries = summaries;
      },
      async save(id: string) {
        const item = (this.databags as TickDataBag[]).find(
          (f) => f.id === id
        ) as TickDataBag;
        return await updateDataBag(item);
      },
      async get(id): Promise<TickDataBag | null> {
        if (!id) { return null; }

        const serverData = await getDetails(id);
        this.patch(serverData);
        return serverData;
      },
      patch(serverData: TickDataBag) {
        this.databags = patchMetaDataList(serverData, this.databags, maxDetailsListItems);

        // const index = (this.databags as TickDataBag[]).findIndex(
        //   (s) => s.id === serverData.id
        // );
        // if (index === -1) {
        //   this.databags.push(serverData);
        // } else {
        //   this.databags.splice(index, 1, serverData);
        // }
      },
    },
    persist: [
      {
        pick: undefined,
        key: PiniaStoragePath.databags,// "tick-databags",
        storage: getTickStorage(PiniaStorageType.Session),
      },
    ],
  }
);

//TODO: => use secure-ls to add more security => https://github.com/JD-Wang/pinia-persistedstate

export default useDataBagsStore;
