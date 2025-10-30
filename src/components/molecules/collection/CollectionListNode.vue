<template>
  <div class="collection" :data-collectionId="getCollectionId">
    <div class="header handle">
      <button :class="headerLevel" :disabled="headerLevel !== 'small'" @click="toggleCollapsed">
        <svg v-if="headerLevel === 'small'" class="toggle" :class="{ collapsed: collapsed }" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 12L10 8L6 4" />
        </svg>
      </button>
      <TickHeading @click="toggleCollapsed" :size="headerLevel">
        {{ this.name }}
      </TickHeading>
      <div class="buttons">

        <TickButton @click="startRename" v-if="!disabled" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Rename) }}</TickButton>
        <TickButton @click="removeCollection" v-if="!disabled" :size="Size.mini" icon="delete" :color="Color.contrast" :appearance="Appearance.secondary">{{ $translate(LanguagePath.App_Remove) }}
        </TickButton>
      </div>

      <div v-if="allowCollectionSelect">
        <TickButton @click="selectCollection" v-if="allowCollectionSelect" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Select) }}
        </TickButton>

      </div>
    </div>
    <template v-if="!collapsed">
      <div class="content" :class="{ empty: !items.length && !collections.length }">
        <span class="no-data" v-if="!items.length && !collections.length">{{ $translate(LanguagePath.App_CollectionsViewer_NoData) }}</span>

        <VueDraggable class="list" group="nested" :sort="false" v-model="items" item-key="id" :component-data="{ name: 'fade' }" ghost-class="ghost" @end="onEndDrag">
          <template #item="{ element }">
            <CollectionEntryNode :item="element" @select="select" />
          </template>
        </VueDraggable>

        <VueDraggable :disabled="true" group="nested" :fallbackOnBody="true" :invertSwap="true" :sort="false" v-model="collections" item-key="id" :component-data="{ name: 'fade' }" ghost-class="ghost"
          @end="onEndDragCollection">
          <template #item="{ element }">
            <CollectionListNode :allowCollectionSelect="this.allowCollectionSelect" :path="getPath(element)" :collection="element" @select="select" @moveObject="moveObject"
              @updateCollection="updateCollection" @moveCollection=this.moveCollection :typeFilters="typeFilters" />
          </template>
        </VueDraggable>

      </div>
    </template>
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from '@/components/atoms/TickInput.vue';
import CollectionEntryNode from "@/components/molecules/collection/CollectionEntryNode.vue";
import TickIcon from '@/components/TickIcon.vue';
import { translate } from '@/plugins/translatePlugin';
import useUserStore from '@/store/user';
import useViewstateStore, { InterfaceStateType } from "@/store/viewstate";
import { Collection, CollectionObject, CollectionObjectTypeEnum, LanguagePath, MoveCollectionRequest, MoveObjectToCollectionRequest, UpdateCollectionRequest } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import * as VueDraggable from "vuedraggable";
import { SelectedItem } from './CollectionsViewer.vue';

@Component({
  name: "CollectionListNode",
  emits: [
    "select", "moveObject", "updateCollection", "moveCollection", "removeCollection", "selectCollection",
  ],
  components: { CollectionEntryNode, TickHeading, VueDraggable, TickInput, TickButton, TickIcon }
})
export default class CollectionListNode extends Vue {
  @Prop() private collection!: Collection;
  @Prop({ default: "/" }) private path!: string;
  @Prop({ default: [] }) private typeFilters: CollectionObjectTypeEnum[];
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ default: false }) private allowCollectionSelect: boolean;
  Size = Size
  Color = Color
  Appearance = Appearance
  LanguagePath = LanguagePath

  private select(item: SelectedItem) {
    this.$emit('select', item);
  }

  private get getCollectionId() {
    return this.collection.id;
  }

  private removeCollection() {
    this.$emit('removeCollection', this.collection.id);
  }
  private selectCollection() {
    this.$emit('selectCollection', this.collection);
  }
  private startRename() {
    var newName = prompt(translate(LanguagePath.App_Question_New_Name));
    this.name = newName;
  }


  private get name() {
    return this.collection.name;
  }
  private set name(to: string) {
    this.collection.name = to;

    const changeData: UpdateCollectionRequest = {
      collectionId: this.collection.id,
      name: to,
    }
    this.updateCollection(changeData);

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onEndDrag(e: any) {
    var targetCol = e.to.closest(".collection");
    var fromCol = e.from.closest(".collection");

    var targetCollectionId = targetCol ? targetCol.dataset.collectionid : null;
    var fromCollectionId = fromCol ? fromCol.dataset.collectionid : null;


    var groupId = e.item.dataset.id; // group id of node
    var type = e.item.dataset.type; // group id of node
    if (targetCollectionId == fromCollectionId) { return; } // drag/drop to same place

    const changeData: MoveObjectToCollectionRequest = {
      versionGroupId: groupId,
      newCollectionId: targetCollectionId,
      objectType: type,
      workspaceId: useUserStore().activeWorkspaceId,
    }
    this.moveObject(changeData);
  }

  private moveObject(req: MoveObjectToCollectionRequest) {
    this.$emit("moveObject", req);
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
    }
    this.moveCollection(changeData);
  }

  private moveCollection(req: MoveCollectionRequest) {
    this.$emit("moveCollection", req);
  }
  private updateCollection(req: UpdateCollectionRequest) {
    this.$emit("updateCollection", req);
  }


  private get collapsed() {
    return useViewstateStore().has(InterfaceStateType.CollectionNodesCollapsed, this.collection.id);
  }

  private toggleCollapsed() {
    useViewstateStore().toggle(InterfaceStateType.CollectionNodesCollapsed, this.collection.id);
  }

  private get headerLevel() {
    return this.path == `/${this.collection.name}/` ? "small" : "xsmall";
  }

  private set items(to: CollectionObject[]) {
    return;
  }

  private get items() {
    const allItems = this.collection.objects || [];
    var items = this.typeFilters.length
      ? allItems.filter(o => this.typeFilters.includes(o.objectType))
      : allItems;

    return items.sort((a, b) => a.name.localeCompare(b.name))
  }

  private get collections() {
    return this.collection.children.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }

  private getPath(collection: Collection) {
    return `${this.path}${collection.name}/`
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  border-radius: 8px;
  overflow: hidden;
}

.collection.ghost {
  background-color: #fff;
  border-radius: 4px;
}

.collection {
  padding-left: 20px;
}

.header {
  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 4px;
  margin-top: 8px;

  .buttons {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    margin-left: 20px;
    flex: 1;
    display: flex;
    gap: 10px;


  }

  &:hover {
    .buttons {
      opacity: 1;
      transition: opacity 0.3s ease-in-out;
    }
  }

}

.content {
  &:not(.empty) {
    background-color: var(--c-base-100);
    border-radius: 8px;
  }

  .no-data {
    font-style: italic;
    font-size: $text-size-regular;
  }
}

.toggle {
  margin-left: -24px;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.toggle:not(.collapsed) {
  transform: rotate(90deg);
}
</style>
