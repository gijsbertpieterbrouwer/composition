<template>
  <template v-if="hasActiveItem">
    <CannedResponseEditor :activeId="selectedItemId" @saved="onSaved" @deleted="onDeleted" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.CannedResponses)">
      <template v-slot:actions>
        <!-- <TickButton @click="addEmpty" v-if="createallowed" :busy="busyAdding">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->

        <TickAddCostItemButton @add="addEmpty" :requiredAuth="AuthorizationObjectType.Ticket" :costItem="SubscriptionCostItemType.CannedResponse" :currentNr="this.currentNr"
          :title="LanguagePath.App_Add" />
      </template>
      <template v-slot:default>
        <div class="list">
          <TickListItem icon="message" :name="item.name" @select="selectItem(item)" v-for="item in this.items" :key="item.id">
            {{ $translate(LanguagePath.CannedResponses) }}
          </TickListItem>
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
import CannedResponseEditor from '@/components/molecules/cannedResponse/CannedResponseEditor.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { RouterToCannedResponse, ViewName } from '@/router';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, LanguagePath, SubscriptionCostItemType, TickCannedResponseDefinition, TickCannedResponseSummary } from '@/TickApi';

@Component({
  directives: { focus },
  components: { TickButton, TickIcon, TickScreen, TickEditorPanel, TickListItem, CannedResponseEditor, TickAddCostItemButton },
})
export default class TickCannedResponses extends Vue {
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType

  private selectedItemId: string | undefined = "";

  private busyAdding = false;

  private get currentNr() {
    return this.items.length;
  }

  private get addAllowedInPlan() {
    const currentNr = this.items.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.CannedResponse, currentNr)
  }

  private get createallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Ticket) && this.addAllowedInPlan;
  }


  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get items() {
    return useManagingStore().cannedResponseSummaries || []
  }


  private addEmpty() {
    useManagingStore().addCannedResponse().then((newItem) => {
      this.selectItem(newItem);
    })
  }

  mounted() {
    useManagingStore().useCannedResponses();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }
  private onDeleted() {
    this.$router.push({ name: ViewName.CannedResponses });
  }
  private onSaved() {
    // 
  }
  private selectItem(item: TickCannedResponseSummary | TickCannedResponseDefinition) {
    //this.$router.push({ params: { ...this.$route.params, id: item.id } });
    RouterToCannedResponse(item.id);
  }

  @Watch("$route.params")
  private paramsChanged(to: TickCannedResponseSummary) {
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
