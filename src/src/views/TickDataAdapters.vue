<template>
  <template v-if="hasActiveItem">
    <AdapterEditor :activeId="selectedItemId" @deleted="onAdapterDeleted" @saved="onAdapterSaved" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.DataAdapters)">
      <template v-slot:actions>
        <!-- <TickButton v-if="allowAdd" @click="addAdapter">{{ $translate(LanguagePath.App_Add) }}</TickButton>
 -->
        <TickAddCostItemButton @add="addAdapter" :requiredAuth="AuthorizationObjectType.TechnicalConfiguration" :costItem="SubscriptionCostItemType.DataAdapter" :currentNr="this.currentNr"
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
  </template>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickButton from "@/components/atoms/TickButton.vue";
import { focus } from "@/directives";

import TickAddCostItemButton from '@/components/atoms/TickAddCostItemButton.vue';
import CollectionsViewer, { SelectedItem } from '@/components/molecules/collection/CollectionsViewer.vue';
import AdapterEditor from '@/components/molecules/dataadapters/AdapterEditor.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import { addAndNavToNewDataAdapter } from '@/helpers/collectionObjectHelper';
import { RouterToItem, TickRouteParams } from '@/router';
import useCollectionsStore from '@/store/collections';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath, SubscriptionCostItemType } from '@/TickApi';


@Component({
  directives: { focus },
  components: { CollectionsViewer, TickButton, AdapterEditor, TickScreen, TickEditorPanel, TickAddCostItemButton },
})
export default class TickDataAdapters extends Vue {
  LanguagePath = LanguagePath;
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType
  private objectTypeFilters: CollectionObjectTypeEnum[] = [CollectionObjectTypeEnum.DataAdapter];
  private selectedItemId = "";

  private get allowAdd(): boolean {
    return this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    const currentNr = this.allItems.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.DataAdapter, currentNr)
  }

  private get currentNr() {
    return this.allItems.length;
  }

  private get allItems() {
    return useCollectionsStore().getByType(CollectionObjectTypeEnum.DataAdapter);
  }

  private async addAdapter() {
    addAndNavToNewDataAdapter();
    // const id = await useDataAdaptersStore().add();
    // this.$router.push({ params: { ...this.$route.params, id } });
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get collections() {
    return useCollectionsStore().collections;
  }

  private onAdapterDeleted() {

    this.$router.push({ name: 'DataAdapters' });
  }

  private onAdapterSaved() {
    // this.$router.push({ name: 'DataAdapters' });
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
