<template>
  <template v-if="hasActiveItem">
    <CommunicatorCategoryDefinitionEditor :activeId="selectedItemId" @saved="onSaved" @deleted=this.onDeleted />
  </template>
  <template v-else>
    <TickFocusScreen :noSidebar="!showSidebar">

      <TickScreen :title="$translate(LanguagePath.CommunicatorCategories)">
        <template v-slot:actions>
          <!-- <TickButton v-if="allowAdd" @click="addEmpty">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->
          <TickAddCostItemButton @add="addEmpty" :requiredAuth="AuthorizationObjectType.ProcessConfiguration" :costItem="SubscriptionCostItemType.CommunicatorCategories" :currentNr="this.currentNr"
            :title="LanguagePath.App_Add" />
        </template>

        <template v-slot:default>
          <div class="list">
            <TickListItem icon="" :name="item.name" @select="selectItem(item)" v-for="item in allCategories" :key="item.id">
              {{ $translate(LanguagePath.CommunicatorCategory) }}
            </TickListItem>
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
import TickListItem from "@/components/atoms/TickListItem.vue";
import CollectionsViewer from '@/components/molecules/collection/CollectionsViewer.vue';
import CommunicatorCategoryDefinitionEditor from "@/components/molecules/communicator/CommunicatorCategoryDefinitionEditor.vue";
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TickSettingsMenu from '@/components/TickSettingsMenu.vue';
import { focus } from "@/directives";
import { askNewName } from "@/helpers/questionHelper";
import { RouterToView, TickRouteParams, ViewName } from '@/router';
import useCollectionsStore from '@/store/collections';
import useManagingStore from "@/store/managingStore";
import useUserStore from '@/store/user';
import useViewstateStore from '@/store/viewstate';
import { AuthorizationObjectType, LanguagePath, SubscriptionCostItemType, TickCommunicatorCategoryDefinitionSummary } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  directives: { focus },
  components: { CollectionsViewer, TickButton, TickScreen, TickEditorPanel, CommunicatorCategoryDefinitionEditor, TickSettingsMenu, TickFocusScreen, TickAddCostItemButton, TickListItem },
})
export default class TickCommunicatorCategoryDefinitions extends Vue {
  LanguagePath = LanguagePath;
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType
  private selectedItemId: string | undefined = "";

  private get currentNr() {
    return this.allCategories.length;
  }
  private get showSidebar() {
    return useViewstateStore().canShowFull;
  }

  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.CommunicatorCategories, this.allCategories.length)
  }
  private get allCategories() {
    return useManagingStore().communicatorCategoryDefinitionSummaries || []
  }


  private async addEmpty() {
    askNewName((name) => {
      if (name) {
        useManagingStore().createCommunicatorCategory(name).then((d) => {
          RouterToView(ViewName.CommunicatorCategories, d.id);
        })
      }
    }, "");


  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get collections() {
    return useCollectionsStore().collections;
  }

  private onDeleted() {

    this.$router.push({ name: ViewName.CommunicatorCategories });
  }

  private onSaved() {
    //this.$router.push({ name: 'TaskDefinitions' });
  }

  mounted() {

    useManagingStore().useCommunicatorCategoryDefinitions();
    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }


  private selectItem(item: TickCommunicatorCategoryDefinitionSummary) {
    RouterToView(ViewName.CommunicatorCategories, item.id);
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || undefined
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;
}
</style>
