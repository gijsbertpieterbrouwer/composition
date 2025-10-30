<template>
  <WizardOptionItem :title="title" :description="description" :subtitle="breakdown" />
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import WizardOptionItem from '@/components/atoms/WizardOptionItem.vue';

@Component({ components: { WizardOptionItem } })
export default class BillingPlanBaseItem extends Vue {
  @Prop() private title!: string;
  @Prop() private breakdown!: string;
  @Prop() private description!: string;
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.item {
  border-bottom: 1px solid $grey300;
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
