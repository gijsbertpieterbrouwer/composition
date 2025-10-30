<template>
  <template v-if="hasActiveItem">
    <MetaDataComponentEditor :activeId="selectedItemId" @deleted="componentDeleted" @saved="componentSaved" />
    <!-- SIDEBAR VIA ROUTER -->
  </template>
  <template v-else>

    <TickScreen :title="$translate(LanguagePath.MetadataComponents)">
      <template v-slot:actions>
        <TickAddCostItemDropdownButton @add="addEmptyComponent" :options="options" :requiredAuth="AuthorizationObjectType.TechnicalConfiguration" :costItem="SubscriptionCostItemType.MetaDataComponent"
          :currentNr="currentNr" :title="LanguagePath.App_Add" />
      </template>

      <template v-slot:default>

        <div class="list">
          <div class="collections">
            <CollectionsViewer class="list" @select="selectItem" :collection="collections" :typeFilters="objectTypeFilters" />
          </div>
        </div>

      </template>

    </TickScreen>
  </template>
</template>

<script lang="ts">
import SectionWithSidebar from '@/components/atoms/SectionWithSidebar.vue';
import TickAddCostItemDropdownButton from '@/components/atoms/TickAddCostItemDropdownButton.vue';
import TickButton from "@/components/atoms/TickButton.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import CollectionsViewer, { SelectedItem } from '@/components/molecules/collection/CollectionsViewer.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import CommunicatorHistoryMetaDataComponent from '@/components/molecules/metadatacomponent/components/CommunicatorHistoryMetaDataComponent.vue';
import DebugMetaDataComponent from '@/components/molecules/metadatacomponent/components/DebugMetaDataComponent.vue';
import GenericMetaDataComponent from '@/components/molecules/metadatacomponent/components/GenericMetaDataComponent.vue';
import ListMetaDataComponent from '@/components/molecules/metadatacomponent/components/ListMetaDataComponent.vue';
import MetaDataComponentEditor from '@/components/molecules/metadatacomponent/MetaDataComponentEditor.vue';
import { addAndNavToEmptyMetaDataComponentDefinition } from '@/helpers/collectionObjectHelper';
import { getComponentDataSourceOptions, MetaDataComponentOption } from '@/helpers/enumsHelper';
import { RouterToItem, TickRouteParams } from '@/router';
import useCollectionsStore from "@/store/collections";
import useUserStore from '@/store/user';
import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath, SubscriptionCostItemType } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  components: {
    TickButton, CollectionsViewer, MetaDataComponentEditor, SectionWithSidebar,
    DebugMetaDataComponent, ListMetaDataComponent, TickScreen, TickEditorPanel, GenericMetaDataComponent,
    CommunicatorHistoryMetaDataComponent, TickDropdown, TickAddCostItemDropdownButton

  }
})
export default class TickMetaDataComponents extends Vue {
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType

  private objectTypeFilters: CollectionObjectTypeEnum[] = [CollectionObjectTypeEnum.MetaDataComponent];
  private selectedItemId: string | undefined = "";

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get currentNr() {
    return this.allItems.length;
  }
  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.MetaDataComponent, this.allItems.length)
  }
  private get allItems() {
    return useCollectionsStore().getByType(CollectionObjectTypeEnum.MetaDataComponent);
  }


  private get collections() {
    return useCollectionsStore().collections;
  }

  // private get metadatacollapsed() {
  //   return useViewstateStore().has(InterfaceStateType.ManageMetaDataMetaDataCollapsed);
  // }

  // private toggleSidebar() {
  //   useViewstateStore().toggle(InterfaceStateType.ManageMetaDataMetaDataCollapsed);
  // }

  private mounted() {
    useCollectionsStore().use();


    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private componentDeleted() {
    this.$router.push({ name: 'MetaDataComponents' });
  }

  private componentSaved() {
    //this.$router.push({ name: 'MetaDataComponents' });
  }

  private get options() {
    return getComponentDataSourceOptions();
  }

  private async addEmptyComponent(selection: MetaDataComponentOption) {
    addAndNavToEmptyMetaDataComponentDefinition(selection);
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
</style>
