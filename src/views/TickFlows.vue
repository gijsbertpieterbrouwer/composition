<template>
  <template v-if="activeItemId">
    <FlowEditor @exit="exitFlowEditor" @navigateToFlow="navigateToFlow" />

  </template>
  <template v-else>

    <TickFocusScreen :noSidebar="!showSidebar">
      <TickScreen :title="$translate(LanguagePath.Flows)">
        <template v-slot:actions>
          <!-- <TickButton v-if="allowAdd" @click="addFlow">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->

          <TickAddCostItemButton @add="addFlow" :requiredAuth="AuthorizationObjectType.ProcessConfiguration" :costItem="SubscriptionCostItemType.Flow" :currentNr="this.currentNr"
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
      <template v-slot:list>
        <TickSettingsMenu />
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
import FlowEditor from '@/components/molecules/flow/FlowEditor.vue';
import TickSettingsMenu from '@/components/TickSettingsMenu.vue';
import { addAndNavToEmptyFlow } from '@/helpers/collectionObjectHelper';
import { RouterToItem, TickRouteParams } from '@/router';
import useCollectionsStore from "@/store/collections";
import useFlowStore from "@/store/flows";
import useUserStore from '@/store/user';
import useViewstateStore from '@/store/viewstate';
import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath, SubscriptionCostItemType } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({ components: { FlowEditor, TickButton, CollectionsViewer, TickScreen, TickEditorPanel, TickFocusScreen, TickSettingsMenu, TickAddCostItemButton } })
export default class TickFlows extends Vue {
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType;


  private objectTypeFilters: CollectionObjectTypeEnum[] = [CollectionObjectTypeEnum.Flow];
  private get currentNr() {
    return this.allItems.length;
  }
  private get allItems() {
    return useCollectionsStore().getByType(CollectionObjectTypeEnum.Flow);
  }
  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    const currentNr = this.allItems.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.Flow, currentNr)
  }


  private get showSidebar() {
    return useViewstateStore().canShowFull;
  }

  private get collections() {
    return useCollectionsStore().collections;
  }

  private get activeItemId() {
    return useFlowStore().activeFlowId;
  }

  private beforeMount() {
    useFlowStore().use();
    useCollectionsStore().use();

    const params = this.$route.params as TickRouteParams
    if (params.id && params.versionId) {
      useFlowStore().activate(params.id, params.versionId);
    } else {
      useFlowStore().activate(null, null);
    }
  }

  private exitFlowEditor() {
    useFlowStore().activeFlowId = null;
    this.activateFlow(null);
    useCollectionsStore().use();
  }

  private navigateToFlow(to: { id: string, versionId: string, instanceId?: string }) {
    //fixme: exit and timeout are needed to get the new stuff into the editor header => but why?
    this.exitFlowEditor();
    setTimeout(function () {
      RouterToItem(CollectionObjectTypeEnum.Flow, to.id, to.versionId, to.instanceId);
    }, 1);

  }

  private async addFlow() {
    addAndNavToEmptyFlow();
  }

  private selectItem(item: SelectedItem) {

    RouterToItem(item.objectType, item.id, item.versionId);

  }

  private activateFlow(id: string | null) {
    this.$router.push({ params: { ...this.$route.params, id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    useFlowStore().activate(to.id || null, to.versionId || null);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.collections {
  width: 440px;
}
</style>
