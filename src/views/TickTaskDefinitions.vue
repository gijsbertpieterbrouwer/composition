<template>
  <template v-if="hasActiveItem">
    <TaskDefinitionEditor :activeId="selectedItemId" @saved="onSaved" @deleted=this.onDeleted />
  </template>
  <template v-else>
    <TickFocusScreen :noSidebar="!showSidebar">

      <TickScreen :title="$translate(LanguagePath.TaskDefinitions)">
        <template v-slot:actions>
          <!-- <TickButton v-if="allowAdd" @click="addEmpty">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->
          <TickAddCostItemButton @add="addEmpty" :requiredAuth="AuthorizationObjectType.ProcessConfiguration" :costItem="SubscriptionCostItemType.TaskDefinition" :currentNr="this.currentNr"
            :title="LanguagePath.App_Add" />
        </template>

        <template v-slot:default>
          <div class="list">
            <div class="collections">
              <CollectionsViewer class="list" @select="selectItem" :collection="collections" :typeFilters="objectTypeFilters" />
            </div>
          </div>
        </template>
      </TickScreen>

      <template #list>
        <TickSettingsMenu />
      </template>

      <template #sidebar>

      </template>
    </TickFocusScreen>

  </template>
</template>

<script lang="ts">
import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickFocusScreen from '@/components/atoms/TickFocusScreen.vue';
import CollectionsViewer, { SelectedItem } from '@/components/molecules/collection/CollectionsViewer.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TaskDefinitionEditor from '@/components/molecules/task/TaskDefinitionEditor.vue';
import TickSettingsMenu from '@/components/TickSettingsMenu.vue';
import { focus } from "@/directives";
import { addAndNavToEmptyTaskDefinition } from '@/helpers/collectionObjectHelper';
import { RouterToItem, TickRouteParams } from '@/router';
import useCollectionsStore from '@/store/collections';
import useUserStore from '@/store/user';
import useViewstateStore from '@/store/viewstate';
import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath, SubscriptionCostItemType } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  directives: { focus },
  components: { CollectionsViewer, TickButton, TickScreen, TickEditorPanel, TaskDefinitionEditor, TickSettingsMenu, TickFocusScreen, TickAddCostItemButton },
})
export default class TickTaskDefinitions extends Vue {
  LanguagePath = LanguagePath;
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType
  private objectTypeFilters: CollectionObjectTypeEnum[] = [CollectionObjectTypeEnum.Task];
  private selectedItemId: string | undefined | null = "";

  private get currentNr() {
    return this.allItems.length;
  }
  private get showSidebar() {
    return useViewstateStore().canShowFull;
  }

  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.TaskDefinition, this.allItems.length)
  }
  private get allItems() {
    return useCollectionsStore().getByType(CollectionObjectTypeEnum.Task);
  }


  private async addEmpty() {
    addAndNavToEmptyTaskDefinition();
    // const id = await useManagingStore().addTaskDefinition()
    // this.$router.push({ params: { ...this.$route.params, id } });
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get collections() {
    return useCollectionsStore().collections;
  }

  private onDeleted() {

    this.$router.push({ name: 'TaskDefinitions' });
  }

  private onSaved() {
    //this.$router.push({ name: 'TaskDefinitions' });
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
    this.selectedItemId = to.id || undefined
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
