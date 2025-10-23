<template>
  <div class="logicalPrefix" :class="[this.colorName]" v-if="logicalPrefix">
    {{ this.logicalPrefix }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { ColorsEnum, ConditionLogicalOperator, LanguagePath } from "@/TickApi";
import { getColorName } from '@/helpers/colorsHelper';
import { translate } from '@/plugins/translatePlugin';

@Component({
  emits: [],
  components: {},
  name: "TickConditionLogicalOperatorIndicator",
})
export default class TickConditionLogicalOperatorIndicator extends Vue {
  @Prop() private data!: ConditionLogicalOperator;
  @Prop() private isFirst!: boolean;

  private get colorName() {
    return getColorName(this.conditionColor);
  }

  private get conditionColor() {
    switch (this.data) {
      case ConditionLogicalOperator.All: return ColorsEnum.Blue;
      case ConditionLogicalOperator.Any: return ColorsEnum.Yellow;
      default: return ColorsEnum.Yellow;
    }
  }

  private get logicalPrefix() {
    if (this.isFirst) { return translate(LanguagePath.Condition_If) }
    switch (this.data) {
      case ConditionLogicalOperator.All: return translate(LanguagePath.ConditionLogicalOperator_And);
      case ConditionLogicalOperator.Any: return translate(LanguagePath.ConditionLogicalOperator_Any);
      default: return translate(LanguagePath.Condition_If)
    }
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.logicalPrefix {
  @include neon-bg;

  height: 29px;
  width: 50px;

  text-align: center;
  padding: 5px;

  //text-transform: uppercase;
  border-radius: 4px;
}
</style>
