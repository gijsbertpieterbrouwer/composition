<template>
  <template v-if="hasActiveItem">
    <FileEditor :activeId="selectedItemId" @deleted="onFileDeleted" @saved="onFileSaved" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.Files)">
      <template v-slot:actions>
        <!-- <TickButton @click="addFile" ref="addButton" v-if="createallowed">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->

        <TickAddCostItemButton @add="addFile" :requiredAuth="AuthorizationObjectType.Workspace" :costItem="SubscriptionCostItemType.WorkspaceFiles" :currentNr="this.currentNr"
          :title="LanguagePath.App_Add" />
      </template>
      <template v-slot:default>

        <div class="list">
          <div class="collections">
            <CollectionsViewer class="list" @select="selectItem" :collection="collections" :typeFilters="objectTypeFilters" :noFilter="true" />
          </div>
        </div>
      </template>
    </TickScreen>

  </template>
</template>


<script lang="ts">
import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import CollectionsViewer, { SelectedItem } from '@/components/molecules/collection/CollectionsViewer.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import FileEditor from '@/components/molecules/files/FileEditor.vue';
import FilesUploadPanel from '@/components/molecules/files/FilesUploadPanel.vue';
import { focus } from "@/directives";
import { mount, unmount } from '@/helpers/mountHelper';
import { RouterToItem, TickRouteParams } from '@/router';
import useCollectionsStore from '@/store/collections';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath, SubscriptionCostItemType } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  directives: { focus },
  components: { CollectionsViewer, TickButton, FileEditor, TickScreen, FilesUploadPanel, TickEditorPanel, TickAddCostItemButton },
})
export default class TickWorkspaceFiles extends Vue {
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType;

  private objectTypeFilters: CollectionObjectTypeEnum[] = [CollectionObjectTypeEnum.File];
  private selectedItemId = "";

  private get currentNr() {
    return this.allItems.length;
  }
  private get allItems() {
    return useCollectionsStore().getByType(CollectionObjectTypeEnum.File);
  }

  private get createallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private async addFile() {
    this.togglePanelFor("addButton")
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get collections() {
    return useCollectionsStore().collections;
  }

  private onFileDeleted() {
    useCollectionsStore().use();
    this.$router.push({ name: 'Files' });
  }
  private onFileSaved() {
    useCollectionsStore().use();
    //this.$router.push({ name: 'Files' });
  }


  mounted() {
    useCollectionsStore().use();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private selectItem(item: SelectedItem) {
    RouterToItem(item.objectType, item.id);
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }



  private activePanel = {
    group: "",
    panelId: "",
    conditionId: "",
  }

  private togglePanelFor(fromRef: string) {
    const isCurrentActivePanel = (this.activePanel.group === fromRef);
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.panelId = this.openPanel(fromRef, {});
  }


  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>) {
    //const control = getRefElement(this, id);
    //const rect = control.getBoundingClientRect();
    //const paddingTop = window.getComputedStyle(control).getPropertyValue('padding-top');

    return mount(FilesUploadPanel, {
      props: {
        ...props,
        // position: {
        //   right: `${window.innerWidth - Math.ceil(rect.left + rect.width)}px`, // 4px because it looks better
        //   top: `${Math.floor(rect.height) + Math.floor(rect.top) + parseInt(paddingTop) - 4}px`,
        // }
      },
      events: {
        exit: () => {
          this.closeActivePanel();
          useCollectionsStore().use();
        },
      }
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.collections {
  width: 440px;
}

.list {}

.filter {
  display: block;
  height: 40px;
  border: 1px solid $grey700;
  width: 440px;
  border-radius: 4px;
  padding: 0 8px;

  &:focus {
    outline: 2px solid black;
  }
}
</style>
