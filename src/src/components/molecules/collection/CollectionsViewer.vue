<template>
  <div class="collections-viewer">
    <template v-if="hasFilteredData">
      <div class="root-collection" :data-collectionid="''">
        <VueDraggable class="list" group="nested" :sort="false" :list="objectsOutsideCollection" item-key="id" :component-data="{ name: 'fade' }" ghost-class="ghost" @end="onEndDrag">
          <template #item="{ element }">
            <CollectionEntryNode :item="element" @select="select" />
          </template>
        </VueDraggable>
      </div>

      <VueDraggable :disabled="true" group="nested" :fallbackOnBody="true" :invertSwap="true" :sort="false" :list="collections" item-key="id"
        :component-data="{ name: 'fade', class: 'collections-list' }" ghost-class="ghost" @end="onEndDragCollection">
        <template #item="{ element }">
          <CollectionListNode :allowCollectionSelect="this.allowCollectionSelect" :disabled="this.disabled" :path="getPath(element)" :collection="element" :typeFilters="typeFilters" @select="select"
            @moveObject="moveObject" @updateCollection="updateCollection" @moveCollection="moveCollection" @removeCollection="removeCollection" @selectCollection="selectCollection" />
        </template>
      </VueDraggable>

      <div class="button-row" v-if="!this.disabled">
        <TickButton class="outline" @click="addEmptyCollection">{{ $translate(LanguagePath.App_CollectionsViewer_AddCollection_Title) }}</TickButton>
      </div>
    </template>
    <template v-else-if="hasData"> {{ $translate(LanguagePath.App_CollectionsViewer_NoFilteredData) }}</template>
    <template v-else>
      <span class="info">{{ $translate(LanguagePath.App_CollectionsViewer_NoData) }}</span>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Collection,
  CollectionObject,
  CollectionObjectTypeEnum,
  DeleteCollectionRequest,
  GetCollectionResponse,
  LanguagePath,
  MoveCollectionRequest,
  MoveObjectToCollectionRequest,
  UpdateCollectionRequest,
} from "@/TickApi";
import CollectionEntryNode from "@/components/molecules/collection/CollectionEntryNode.vue";
import CollectionListNode from "@/components/molecules/collection/CollectionListNode.vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

import TickIcon from "@/components/TickIcon.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import { getDebounced } from "@/helpers/debounce";
import { onConfirmation } from "@/helpers/questionHelper";
import { translate } from "@/plugins/translatePlugin";
import useCollectionsStore from "@/store/collections";
import useUserStore from "@/store/user";
import * as VueDraggable from "vuedraggable";

export interface SelectedItem {
  id: string;
  versionId: string;
  objectType: CollectionObjectTypeEnum;
  collectionObject: CollectionObject;
}

@Component({
  name: "CollectionsViewer",
  emits: ["select", "selectCollection"],
  components: {
    CollectionEntryNode,
    CollectionListNode,
    TickIcon,
    VueDraggable,
    TickButton,
  },
})
export default class CollectionsViewer extends Vue {
  LanguagePath = LanguagePath
  @Prop() private collection!: GetCollectionResponse;
  @Prop({ default: [] }) private typeFilters!: CollectionObjectTypeEnum[];
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ default: false }) private allowCollectionSelect: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onEndDrag(e: any) {
    var targetCol = e.to.closest(".collection");
    var fromCol = e.from.closest(".collection");

    var targetCollectionId = targetCol ? targetCol.dataset.collectionid : null;
    var fromCollectionId = fromCol ? fromCol.dataset.collectionid : null;

    var groupId = e.item.dataset.id; // group id of node
    var type = e.item.dataset.type; // group id of node
    if (targetCollectionId == fromCollectionId) {
      return;
    } // drag/drop to same place

    const changeData: MoveObjectToCollectionRequest = {
      versionGroupId: groupId,
      newCollectionId: targetCollectionId,
      objectType: type,
      workspaceId: useUserStore().activeWorkspaceId,
    };

    this.moveObject(changeData);
    // this.$emit("stepActionIndexChange", changeData);
  }

  private moveObject(req: MoveObjectToCollectionRequest) {
    useCollectionsStore().moveObject(req);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onEndDragCollection(e: any) {
    const toCol = e.to.closest(".collection");
    var targetCollectionId = toCol ? toCol.dataset.collectionid : null;
    var collectionId = e.item.dataset.collectionid; // collection id

    // if (targetCollectionId == fromCollectionId) { return; } // drag/drop to same place

    const changeData: MoveCollectionRequest = {
      collectionId: collectionId,
      newParentId: targetCollectionId,
    };
    this.moveCollection(changeData);
  }

  private debouncedCollectionName!: (args: UpdateCollectionRequest) => void;
  beforeMount() {
    this.debouncedCollectionName = getDebounced<UpdateCollectionRequest>(
      (req: UpdateCollectionRequest) => {
        useCollectionsStore().updateCollection(req);
      },
      500
    );
  }

  private updateCollection(req: UpdateCollectionRequest) {
    this.debouncedCollectionName(req);
  }

  private moveCollection(req: MoveCollectionRequest) {
    useCollectionsStore().moveCollection(req);
  }

  private addEmptyCollection() {
    useCollectionsStore().createCollection({
      name: "New collection",
      workspaceId: useUserStore().activeWorkspaceId,
      parentId: null,
    });
  }

  private selectCollection(collection: Collection) {
    this.$emit("selectCollection", collection);
  }

  private removeCollection(id: string, confirmed?: boolean) {
    const req: DeleteCollectionRequest = {
      collectionId: id,
      confirmed: confirmed,
    };
    useCollectionsStore()
      .removeCollection(req)
      .then((data) => {
        if (!data.isDeleting) {
          const noNeedForConfirmation = data.isDeleting == false && data.numberOfObjects == 0;

          if (noNeedForConfirmation) {
            this.removeCollection(id, true);
          } else {
            onConfirmation(() => {
              this.removeCollection(id, true);
            }, translate(LanguagePath.App_CollectionsViewer_DeleteConfirmation, [{ path: 'numberOfObjects', value: data.numberOfObjects.toString() }, { path: 'numberOfCollections', value: data.numberOfCollections.toString() }]));
          }

          // if (
          //   noNeedForConfirmation ||
          //   askConfirmation(translate(LanguagePath.App_CollectionsViewer_DeleteConfirmation, [{ path: 'numberOfObjects', value: data.numberOfObjects.toString() }, { path: 'numberOfCollections', value: data.numberOfCollections.toString() }]))
          // ) {
          //   this.removeCollection(id, true);
          // }


        }
      });
  }

  private get hasData() {
    return (
      (this.collection.collections && this.collection.collections.length) ||
      (this.collection.objectsOutsideCollection &&
        this.collection.objectsOutsideCollection.length)
    );
  }

  private get hasFilteredData() {
    return this.objectsOutsideCollection.length || this.collections.length;
  }

  private select(item: SelectedItem) {
    this.$emit("select", item);
  }

  private set objectsOutsideCollection(to: CollectionObject[]) {
    return;
  }

  private get objectsOutsideCollection() {
    const allItems = this.collection.objectsOutsideCollection || [];

    var objects = this.typeFilters.length
      ? allItems.filter((o) => this.typeFilters.includes(o.objectType))
      : allItems;

    return objects.sort((a, b) => a.name.localeCompare(b.name));
  }

  private get collections() {
    if (!this.collection || !this.collection.collections) {
      return [];
    }
    return (
      this.collection.collections.sort((a, b) =>
        a.name.localeCompare(b.name)
      ) || []
    );
  }

  private getPath(collection: Collection) {
    return `/${collection.name}/`;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  border-radius: 8px;
  overflow: hidden;
}

.root-collection {
  background-color: var(--c-base-100);
  border-radius: 8px;
}

.collections-viewer,
.collections-list {
  display: grid;
  gap: 24px;

}


.info {
  font-style: italic;
  font-size: $text-size-regular;
}
</style>
