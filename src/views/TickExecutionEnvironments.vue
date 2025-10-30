<template>
  <template v-if="hasActiveItem">
    <ExecutionEnvironmentEditor :activeId="selectedItemId" @deleted="environmentDeleted" @saved="environmentSaved" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.ExecutionEnvironments)">
      <template v-slot:actions>
        <!-- <TickButton @click="addEmptyExecutionEnvironment" v-if="allowAdd" :busy="busyAdding">Add</TickButton>
 -->

        <TickAddCostItemButton @add="addEmptyExecutionEnvironment" :requiredAuth="AuthorizationObjectType.TechnicalConfiguration" :costItem="SubscriptionCostItemType.ExecutionEnvironment"
          :currentNr="this.currentNr" :title="LanguagePath.App_Add" />

      </template>

      <template v-slot:default>

        <div class="list">
          <TickListItem icon="environment" :name="item.name" @select="selectItem(item)" v-for="item in this.listItems" :key="item.id">
            <ExecutionEnvironmentLabel :environmentId="item.id" />
          </TickListItem>
        </div>

      </template>
    </TickScreen>
  </template>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-facing-decorator";

import {
  AuthorizationObjectType,
  LanguagePath,
  MetaDataItem,
  SubscriptionCostItemType,
  TickExecutionEnvironmentSummary,
} from "@/TickApi";
import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickEditorPanel from "@/components/molecules/editor/TickEditorPanel.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import ExecutionEnvironmentEditor from "@/components/molecules/executionEnvironment/ExecutionEnvironmentEditor.vue";
import ExecutionEnvironmentLabel from "@/components/molecules/executionEnvironment/ExecutionEnvironmentLabel.vue";
import { TickRouteParams, ViewName } from "@/router";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
@Component({
  components: {
    TickScreen,
    TickButton,
    TickEditorPanel,
    TickInput,
    ExecutionEnvironmentEditor,
    TickListItem,
    ExecutionEnvironmentLabel,
    TickAddCostItemButton
  },
})
export default class TickExecutionEnvironments extends Vue {
  LanguagePath = LanguagePath;
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType;

  private selectedItemId: string | undefined = "";
  private busyAdding = false;

  private get currentNr() {
    return this.listItems.length;
  }
  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get addAllowedInPlan() {
    const currentNr = this.listItems.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.ExecutionEnvironment, currentNr)
  }

  private get allowAdd() {
    return this.addAllowedInPlan && useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration);
  }

  private addEmptyExecutionEnvironment() {
    useManagingStore()
      .addEnvironment({
        workspaceId: useUserStore().activeWorkspaceId ?? "",
        name: "New Environment",
      })
      .then((newItem) => {
        this.selectId(newItem.id);
      });
  }
  private get listItems() {
    const all = useManagingStore().environmentSummaries;
    return all;
  }

  private onCreation(item: MetaDataItem) {
    this.selectId(item.id);
  }

  private environmentDeleted() {
    this.$router.push({ name: ViewName.Environments });
  }

  private environmentSaved() {
    //
  }

  private selectItem(item: TickExecutionEnvironmentSummary) {
    this.selectId(item.id);
  }

  private selectId(id: string) {
    this.$router.push({ params: { ...this.$route.params, id: id } });
  }

  mounted() {
    useManagingStore().useEnvironments();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
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
