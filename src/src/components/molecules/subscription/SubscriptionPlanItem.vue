<template>
  <WizardOptionButton v-if="plan.visible" @select="select" class="plan" :name="plan.name" :selected="plan.selected" :indicator="indicator">
    {{ this.plan.descriptionMarkDown }}
  </WizardOptionButton>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickButton from '@/components/atoms/TickButton.vue';
import { BillingCalculationPeriod, ColorsEnum, TickSubscriptionPlan, LanguagePath } from '@/TickApi';
import WizardOptionButton from '@/components/atoms/WizardOptionButton.vue';
import { TickIndicatorData } from '@/components/atoms/TickIndicator.vue';
import { translate } from '@/plugins/translatePlugin';

@Component({
  emits: ["select"],
  components: { TickButton, WizardOptionButton }
})
export default class SubscriptionPlanItem extends Vue {
  @Prop() private plan: TickSubscriptionPlan;
  @Prop() private selected: boolean;

  private get disabled() {
    return !this.plan.allowSubscribe;
  }

  private select() {
    this.$emit("select");
  }

  private get hasIndicator(): boolean {
    return !this.plan.hasCustomBaseCost && this.plan.baseCost > 0 && this.plan.baseCostCalculationPeriod == BillingCalculationPeriod.Month;
  }

  private get indicator(): TickIndicatorData {
    if (!this.hasIndicator) { return null; }

    return {
      color: ColorsEnum.Lime,
      title: `${this.plan.baseCost},-`,
      tooltip: translate(LanguagePath.App_SubscriptionPlanItem_Indicator_Title, { path: 'baseCost', value: this.plan.baseCost.toString() }),//  `${this.plan.baseCost} euro per month`,
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
