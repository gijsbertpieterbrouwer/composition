<template>
  <template v-if="hasActiveItem">
    <SlaDefinitionEditor :activeId="selectedItemId" @deleted="itemDeleted" @saved="itemSaved" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.SLAs)">
      <template v-slot:actions>
        <!-- <TickButton @click="addEmptyComponent">Add</TickButton> -->
        <!-- <TickDropdown v-if="allowAdd" @select="addEmptySlaDefinition" :options="slaTypeOptions" :placeholder="$translate(LanguagePath.App_Add)"></TickDropdown> -->

        <TickAddCostItemDropdownButton @add="addEmptySlaDefinition" :options="slaTypeOptions" :requiredAuth="AuthorizationObjectType.ProcessConfiguration" :costItem="SubscriptionCostItemType.Sla"
          :currentNr="currentNr" :title="LanguagePath.App_Add" />
      </template>

      <template v-slot:default>

        <div class="list">
          <TickListItem icon="sla" :name="item.name" @select="selectItem(item)" v-for="item in this.items" :key="item.id">
            <TickLabel :disableCollapse="true" :name="labelName(item)" :color="labelColor(item)" :disableToggle="true" />&nbsp;
            <TickLabel :disableCollapse="true" :name="typeLabelName(item)" :color="ColorsEnum.Blue" :disableToggle="true" />
          </TickListItem>
        </div>

      </template>
    </TickScreen>
  </template>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-facing-decorator";

import TickButton from "@/components/atoms/TickButton.vue";
import TickLabel from "@/components/atoms/TickLabel.vue";

import TickAddCostItemDropdownButton from "@/components/atoms/TickAddCostItemDropdownButton.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import SlaDefinitionEditor from "@/components/molecules/sla/SlaDefinitionEditor.vue";
import { getSlaTypeAbbreviation, getSlaTypeOptions } from "@/helpers/enumsHelper";
import { TickRouteParams, ViewName } from "@/router";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import { AuthorizationObjectType, ColorsEnum, LanguagePath, SlaType, SubscriptionCostItemType, TickSlaDefinitionSummary } from "@/TickApi";

@Component({
  components: {
    SlaDefinitionEditor,
    TickButton,
    TickScreen,
    TickListItem,
    TickLabel,
    TickDropdown, TickAddCostItemDropdownButton
  },
})
export default class TickSlaDefinitions extends Vue {
  ColorsEnum = ColorsEnum
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType;

  private selectedItemId = "";

  private get slaTypeOptions() {
    return getSlaTypeOptions();
  }
  private get currentNr() {
    return this.items.length;
  }

  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.Sla, this.items.length)
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }


  private typeLabelName(item: TickSlaDefinitionSummary): string {
    return getSlaTypeAbbreviation(item.slaType);
  }


  private labelName(item: TickSlaDefinitionSummary): string {
    return item.active ? "active" : "inactive"
  }

  private labelColor(item: TickSlaDefinitionSummary): ColorsEnum {
    return item.active ? ColorsEnum.Green : ColorsEnum.Grey
  }

  private mounted() {
    useManagingStore().useSlaDefinitions();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private get items() {
    const all = useManagingStore().slaDefinitionSummaries;
    return all;
  }

  private itemDeleted() {
    this.$router.push({ name: ViewName.SlaDefinitions });
  }

  private itemSaved() {
    // 
  }

  private addEmptySlaDefinition(type: SlaType) {
    this.addEmptyComponent(type);
  }

  private async addEmptyComponent(type: SlaType) {
    const item = await useManagingStore().addSlaDefinition({
      workspaceId: useUserStore().activeWorkspaceId,
      type: type,
    });

    this.selectItem(item);
  }

  private selectItem(item: TickSlaDefinitionSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
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
