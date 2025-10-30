<template>
  <div class="condition-element">
    <template v-if="isSingle == true">
      <TickCondition :isFirst="isFirst" :groupLogicalOperator="groupLogicalOperator" :condition="condition" @patch="onUpdate" @remove="removeCondition" :disabled="disabled"
        :disableInputSource="disableInputSource" :disabledInputSourceText="disabledInputSourceText" />
    </template>
    <template v-else>
      <TickConditionGroupEditor class="group" :isFirst="isFirst" :groupLogicalOperator="groupLogicalOperator" :condition="condition" @patch="onUpdate" @remove="removeCondition" :disabled="disabled"
        :disableGroups="disableGroups" :disableInputSource="disableInputSource" :disabledInputSourceText="disabledInputSourceText" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { Condition, ConditionElement, ConditionGroup, ConditionLogicalOperator } from "@/TickApi";
import TickInput from '../../../atoms/TickInput.vue';
import TickCondition from './TickCondition.vue';
import TickConditionGroupEditor from './TickConditionGroupEditor.vue';

@Component({
  emits: ["patch", "remove"],
  components: { TickInput, TickCondition, TickConditionGroupEditor },
  name: "TickConditionElement",
})
export default class TickConditionElement extends Vue {
  @Prop() private condition!: Condition | ConditionGroup;
  @Prop() private disabled!: boolean;
  @Prop() private groupLogicalOperator!: ConditionLogicalOperator;
  @Prop() private isFirst!: boolean;
  @Prop() private disableGroups!: boolean;
  @Prop() private disableInputSource!: boolean;
  @Prop() private disabledInputSourceText!: string;

  private onUpdate() {
    this.$emit("patch", this.condition);
  }

  private get isSingle() {
    const isSingle = this.condition.elementType == ConditionElement.Single
    return isSingle;
  }

  private removeCondition() {
    this.$emit("remove", this.condition);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.group {
  margin-bottom: 10px;
  margin-top: 10px;
}
</style>
