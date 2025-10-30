<template>
  <div class="item">
    <div class="title">{{ this.title }}</div>
    <div class="breakdown">{{ this.breakdown }}</div>
    <!-- <div class="description">{{ this.description }}</div>  -->
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import WizardOptionItem from '@/components/atoms/WizardOptionItem.vue';
import { TenantSubscriptionPlanCreditItem } from '@/TickApi';
import { getCostItemTypeName } from '@/helpers/enumsHelper';
import { translate } from '@/plugins/translatePlugin';
import { LanguagePath } from '@/TickApi';

@Component({ components: { WizardOptionItem } })
export default class PlanCreditItem extends Vue {
  @Prop() private item!: TenantSubscriptionPlanCreditItem;

  private get title() {
    return translate(LanguagePath.App_Subscription_PlanCreditItem_Title, {path: 'name', value: getCostItemTypeName(this.item.type)}) ;
  }

  private get breakdown() {
    return translate(LanguagePath.App_Subscription_PlanCreditItem_Breakdown, [{path: 'name', value: getCostItemTypeName(this.item.type)}, {path: 'value', value: this.item.value}]);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.item {
  border-bottom: 1px solid $grey300;
  // background-color: #fff;
  padding: 12px 10px;
  display: grid;
  gap: 5px;

  .title {
    font-size: 20px;
    line-height: 20px;

    font-weight: 600;
  }

  .breakdown {
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--sub-text);

  }

  .description {
    font-size: $text-size-regular;
    line-height: 12px;
    color: var(--sub-text);
    font-style: italic;
    opacity: 0.7;
  }

}
</style>
