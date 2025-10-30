<template>
  <BillingPlanBaseItem :title="item.name" :breakdown="breakdown" :description="description" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import { CurrencyType, SubscriptionCostItemType, TenantSubscriptionPlanBillingNumericItem, LanguagePath } from '@/TickApi';
import { getBillingCalculationPeriodName, getCurrencyName } from '@/helpers/enumsHelper';
import BillingPlanBaseItem from './BillingPlanBaseItem.vue';
import { translate } from '@/plugins/translatePlugin';

@Component({ components: { TickScreen, TickEditorPanel, BillingPlanBaseItem } })
export default class BillingPlanNumericItem extends Vue {
  @Prop() private item!: TenantSubscriptionPlanBillingNumericItem;
  @Prop() private currency!: CurrencyType;

  private get description() {
    return this.item.description;
  }

  private get costText() {
    const cost = this.item.cost;
    const ct = cost.toFixed(2);
    return `${ct} ${this.currencyName.toLowerCase()}`;
  }

  private get breakdown() {

    const breakDownLanguageTokens = [
      { path: 'cost', value: this.costText },
      { path: 'name', value: this.item.name.toLowerCase() },
      { path: 'period', value: this.calculationPeriod },
    ]

    switch (this.item.type) {
      case SubscriptionCostItemType.CompletedTickets:
        return translate(LanguagePath.App_BillingPlanNumericItem_Breakdown_Ticket_Title, breakDownLanguageTokens);//`${this.costText} per ${this.item.name.toLowerCase()}`;
      default: return translate(LanguagePath.App_BillingPlanNumericItem_Breakdown_Other_Title, breakDownLanguageTokens) // `${this.costText} per ${this.item.name.toLowerCase()} per ${this.calculationPeriod}`;
    }
  }

  private get calculationPeriod() {
    return getBillingCalculationPeriodName(this.item.calculationPeriod)
  }

  private get currencyName() {
    return getCurrencyName(this.currency);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.item {
  border-bottom: 1px solid $grey300;
  //background-color: #fff;
  padding: 12px 10px;

  .title {
    font-size: 20px;
    line-height: 20px;
  }

  .breakdown {
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--sub-text);
  }

  .description {
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--sub-text);
    font-style: italic;
  }

}
</style>
