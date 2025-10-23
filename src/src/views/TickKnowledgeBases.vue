<template>
  <template v-if="hasActiveItem">
    <KnowledgeBaseEditor :activeId="selectedItemId" @saved="onSaved" @deleted="onDeleted" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.KnowledgeBases)">
      <template v-slot:actions>
        <!-- <TickButton @click="addEmpty" v-if="allowAdd" :busy="busyAdding">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->
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
  </template>
</template>



<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickAddCostItemButton from '@/components/atoms/TickAddCostItemButton.vue';
import TickButton from "@/components/atoms/TickButton.vue";
import TickListItem from '@/components/atoms/TickListItem.vue';
import CollectionsViewer from '@/components/molecules/collection/CollectionsViewer.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import KnowledgeBaseEditor from '@/components/molecules/knowledgebase/KnowledgeBaseEditor.vue';
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import useCollectionsStore from '@/store/collections';
import useManagingStore from '@/store/managingStore';
import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath, SubscriptionCostItemType, TickKnowledgeBaseSummary } from '@/TickApi';

@Component({
  directives: { focus },
  components: { TickButton, TickIcon, TickScreen, TickEditorPanel, TickListItem, KnowledgeBaseEditor, CollectionsViewer, TickAddCostItemButton },
})
export default class TickKnowledgeBases extends Vue {
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType;


  private objectTypeFilters: CollectionObjectTypeEnum[] = [CollectionObjectTypeEnum.KnowledgeBase];
  private selectedItemId = "";

  private get currentNr() {
    return this.allItems.length;
  }

  private get collections() {
    return useCollectionsStore().collections;
  }

  private get allItems() {
    return useCollectionsStore().getByType(CollectionObjectTypeEnum.KnowledgeBase);
  }

  // private get addAllowedInPlan() {
  //   const currentNr = this.items.length;
  //   return useUserStore().allowedAddInPlan(SubscriptionCostItemType.Knowledgebase, currentNr)
  // }

  // private get allowAdd() {
  //   return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration) && this.addAllowedInPlan;
  // }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  // private get items(): TickKnowledgeBaseSummary[] {
  //   return useManagingStore().knowledgebaseSummaries || []
  // }


  private addEmpty() {
    useManagingStore().addKnowledgeBase().then((newItem: TickKnowledgeBaseSummary) => {
      this.selectItem(newItem);
    })
  }

  // mounted() {
  //   useManagingStore().useKnowledgeBases();

  //   if (this.$route.params.id) {
  //     this.selectedItemId = this.$route.params.id.toString();
  //   }
  // }

  mounted() {
    useCollectionsStore().use();


    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }




  private onDeleted() {
    this.$router.push({ name: 'KnowledgeBases' });
  }
  private onSaved() {
    // this.$router.push({ name: 'CannedResponses' });
  }
  private selectItem(item: TickKnowledgeBaseSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickKnowledgeBaseSummary) {
    this.selectedItemId = to.id || null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

// .list {
//   background-color: var(--c-base-100);
//   border-radius: 8px;
//   overflow: hidden;
// }

.collections {
  width: 440px;
}
</style>
