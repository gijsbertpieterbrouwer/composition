<template>
  <tr class="item" :title="tooltip">
    <td class="description">{{ this.description }}</td>
    <td class="numeric">
      <TickIcon v-if="creditIsUnlimited" name="unlimited" />
      <template v-else>{{ this.creditAmount }}</template>
    </td>
    <td class="numeric">
      <TickIcon v-if="isUnlimited" name="unlimited" />
      <template v-else>{{ this.amount }}</template>
    </td>
  </tr>
</template>


<script lang="ts">
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TickIcon from '@/components/TickIcon.vue';
import { getCostItemTypeName } from '@/helpers/enumsHelper';
import { unlimited } from '@/helpers/guid';
import { translate } from '@/plugins/translatePlugin';
import { LanguagePath, TenantSubscriptionPlanCreditItem, TenantSubscriptionPlanNumericItem } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import BillingPlanBaseItem from './BillingPlanBaseItem.vue';


@Component({ components: { TickScreen, TickEditorPanel, BillingPlanBaseItem, TickIcon } })
export default class PlanDataNumericItem extends Vue {
  @Prop() private item!: TenantSubscriptionPlanNumericItem;
  @Prop() private credit: TenantSubscriptionPlanCreditItem;

  private get isUnlimited(): boolean {
    return this.item.value == unlimited;
  }
  private get amount(): string {
    if (this.isUnlimited) { return translate(LanguagePath.Unlimited); }

    if (this.item.value == 0) { return "-"; }
    return this.item.value.toString();
  }

  private hasCredit(): boolean {
    return this.credit != null && this.credit != undefined;
  }

  private get creditIsUnlimited(): boolean {
    return this.credit?.value == unlimited;
  }
  private get creditAmount(): string {
    if (!this.hasCredit) { return ""; }
    if (this.creditIsUnlimited) { return translate(LanguagePath.Unlimited); }

    if (this.credit?.value == 0) { return "-"; }
    return this.credit?.value.toString();
  }

  private get itemName(): string {
    return getCostItemTypeName(this.item.type);
  }

  private get description(): string {
    return `${this.itemName}`
  }

  private get tooltip() {
    return this.isUnlimited ?
      translate(LanguagePath.App_Subscription_PlanDataNumericItem_Unlimited_Tooltip, { path: 'name', value: this.itemName }) //  `Unlimited ${this.itemName}` 
      : `${this.amount} ${this.itemName}`;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
