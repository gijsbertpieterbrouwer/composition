import { _ActionsTree, _GettersTree, defineStore } from "pinia";

import { CreateCollection, DeleteCollection, GetCollections, MoveCollection, MoveCollectionObject, UpdateCollection } from "@/services/CollectionsService";
import { Collection, CollectionObject, CollectionObjectTypeEnum, CreateCollectionRequest, DeleteCollectionRequest, DeleteConfirmationInfo, GetCollectionResponse, MoveCollectionRequest, MoveObjectToCollectionRequest, ObjectRemovalProgress, UpdateCollectionRequest } from "@/TickApi";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

interface State {
  collections: GetCollectionResponse
  loaded: boolean
}

interface Getters extends _GettersTree<State> {
  getByType: (state: State) => (type: CollectionObjectTypeEnum) => CollectionObject[];

}

interface Actions extends _ActionsTree {
  use(): void;
  deleteFromRTC(update: ObjectRemovalProgress): void
  moveObject(req: MoveObjectToCollectionRequest): void
  updateCollection(req: UpdateCollectionRequest): void
  moveCollection(req: MoveCollectionRequest): void
  createCollection(req: CreateCollectionRequest): void
  removeCollection(req: DeleteCollectionRequest): Promise<DeleteConfirmationInfo>;
}

function flattenCollection(root: GetCollectionResponse): CollectionObject[] {
  let r: CollectionObject[] = root?.objectsOutsideCollection || [];

  for (let index = 0; index < root?.collections?.length; index++) {
    const c = root.collections[index];
    const items = flattenCollectionList(c);
    r = r.concat(items);
  }

  return r;
}

function flattenCollectionList(collection: Collection): CollectionObject[] {
  let r: CollectionObject[] = collection?.objects || [];

  for (let index = 0; index < collection?.children?.length; index++) {
    const c = collection.children[index];
    const items = flattenCollectionList(c);
    r = r.concat(items);
  }

  return r;
}



const useCollectionsStore = defineStore<"collections", State, Getters, Actions>("collections", {
  state: () => ({
    collections: {},
    loaded: false,
  }),
  getters: {
    getByType(state) {
      const all = flattenCollection(state.collections);

      return (type: CollectionObjectTypeEnum) => {
        return all.filter(p => p.objectType == type);
      }
    },
  },
  actions: {
    async deleteFromRTC() {
      this.use();
    },
    async use() {
      const newCollections = await GetCollections(useUserStore().activeWorkspaceId);
      this.collections = newCollections

      this.loaded = true;
    },
    async moveObject(req: MoveObjectToCollectionRequest) {
      await MoveCollectionObject(req);
      this.use();
    },
    async moveCollection(req: MoveCollectionRequest) {
      await MoveCollection(req);
      this.use();
    },
    async updateCollection(req: UpdateCollectionRequest) {
      await UpdateCollection(req);
      //this.use();
    },
    async createCollection(req: CreateCollectionRequest) {
      await CreateCollection(req);
      this.use();
    },
    async removeCollection(req: DeleteCollectionRequest): Promise<DeleteConfirmationInfo> {
      const response = await DeleteCollection(req);
      if (response.isDeleting) {
        this.use();
      }
      return response;
    },

  },
  // persist: {
  //   enabled: true,
  //   strategies: [{
  //     key: "tick-collections",
  //     storage: window.localStorage,
  //   }]
  // },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.collections,
      storage: getTickStorage(PiniaStorageType.Local),
    },
  ],
});

export default useCollectionsStore;
