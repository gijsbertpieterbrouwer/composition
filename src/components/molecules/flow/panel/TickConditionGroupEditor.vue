<template>
  <div class="group" :class="{ isRoot: this.isFirst }">
    <div class="header">
      <TickConditionLogicalOperatorIndicator v-if="canRemoveGroup" :isFirst="isFirst" :data="groupLogicalOperator" />
      <TickSelector v-if="hasMultiple" v-model="logicalOperator" :options="logicalOperatorOptions" :disabled="disabled" />

      <div class="actions">
        <button v-if="canRemoveGroup" class="toggle-visibility" @click="toggleMinimize">
          <TickIcon :name="toggleMinimizeIcon" />
        </button>
      </div>
    </div>


    <template v-if="!showMinimized">

      <template v-for="(childCondition, index) in this.condition.conditions" :key="childCondition.id">
        <TickConditionElement :isFirst="index == 0" :groupLogicalOperator="logicalOperator" :ref="childCondition.id" :condition="childCondition" @patch="conditionUpdated" @remove="deleteCondition"
          :disabled="disabled" :disableGroups="disableGroups" :disableInputSource="disableInputSource" :disabledInputSourceText="disabledInputSourceText" />
      </template>

      <div class="buttons-container">
        <TickButton v-if="!disabled" @click="addConditionElement(ConditionElement.Single)" :color="Color.contrast" :size="Size.mini" :appearance="Appearance.secondary" icon="plus">
          {{ $translate(LanguagePath.App_ConditiongroupEditor_AddCondition) }}

        </TickButton>
        <TickButton v-if="canAddGroup" @click="addConditionElement(ConditionElement.Group)" :color="Color.contrast" :size="Size.mini" :appearance="Appearance.secondary" icon="plus">
          {{ $translate(LanguagePath.App_ConditiongroupEditor_AddConditionGroup) }}
        </TickButton>

      </div>
    </template>
  </div>
</template>

<script lang="ts">
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickIcon from '@/components/TickIcon.vue';
import { getColorName } from '@/helpers/colorsHelper';
import { getDefaultCondition } from '@/helpers/conditionHelper';
import { conditionTypeOptions } from '@/helpers/enumsHelper';
import { getLogicalOperatorOptions } from '@/helpers/flowhelpers';
import generateId from '@/helpers/guid';
import { ColorsEnum, ConditionElement, ConditionGroup, ConditionLogicalOperator, ICondition, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickButton, { Appearance, Color, Size } from '../../../atoms/TickButton.vue';
import TickInput from '../../../atoms/TickInput.vue';
import TickConditionElement from './TickConditionElement.vue';
import TickConditionLogicalOperatorIndicator from './TickConditionLogicalOperatorIndicator.vue';

@Component({
  emits: ["patch", "remove"],
  components: { TickInput, TickConditionElement, TickButton, TickSelector, TickIcon, TickConditionLogicalOperatorIndicator },
  name: "TickConditionGroupEditor",
})
export default class TickConditionGroupEditor extends Vue {
  Color = Color
  Size = Size
  Appearance = Appearance
  ConditionElement = ConditionElement;
  LanguagePath = LanguagePath

  @Prop() private condition!: ConditionGroup;
  @Prop() private disabled!: boolean;
  @Prop() private groupLogicalOperator!: ConditionLogicalOperator;
  @Prop() private isFirst!: boolean;
  @Prop() private disableGroups!: boolean;
  @Prop() private disableInputSource!: boolean;
  @Prop() private disabledInputSourceText!: string;

  private showMinimized = false;

  private toggleMinimize() {
    this.showMinimized = !this.showMinimized;
  }

  private get canRemoveGroup(): boolean {
    if (this.disabled) { return false; }
    if (this.isFirst) { return false; }
    return true;
  }
  private get canAddGroup(): boolean {
    if (this.disabled) { return false; }
    if (this.disableGroups) { return false; }
    if (this.condition.conditions.length == 0) { return false; }


    return true;
  }

  private get toggleMinimizeIcon() {
    return this.showMinimized ? "eye-off" : "eye";
  }

  private get hasMultiple() {
    return this.condition?.conditions?.length > 1;
  }

  private get colorName() {
    return getColorName(this.conditionColor);
  }


  private get conditionColor() {
    switch (this.groupLogicalOperator) {
      case ConditionLogicalOperator.All: return ColorsEnum.Sky;
      case ConditionLogicalOperator.Any: return ColorsEnum.BoldPink;
      default: return ColorsEnum.Grey;
    }
  }

  // private get logicalPrefix() {
  //   switch (this.groupLogicalOperator) {
  //     case ConditionLogicalOperator.All: return translate(LanguagePath.ConditionLogicalOperator_And);
  //     case ConditionLogicalOperator.Any: return translate(LanguagePath.ConditionLogicalOperator_Any);
  //     default: return "-"
  //   }
  // }



  private conditionUpdated() {
    this.$emit("patch", this.condition);
  }

  private get getElementTypeOptions() {
    return conditionTypeOptions();
  }

  private get logicalOperatorOptions() {
    return getLogicalOperatorOptions();
  }

  private get logicalOperator() {
    return this.condition.logicalOperator;
  }

  private set logicalOperator(to: ConditionLogicalOperator) {
    this.condition.logicalOperator = to;
    this.conditionUpdated();
  }

  private remove() {
    this.$emit("remove", this.condition);
  }

  private deleteCondition(condition: ICondition) {
    const index = this.condition.conditions.findIndex(a => a.id == condition.id);
    if (index != -1) {
      this.condition.conditions.splice(index, 1);
      this.conditionUpdated();
    }

    if (this.condition.conditions.length == 0) {
      this.remove()
    }
  }

  private addConditionElement(type: ConditionElement) {
    var condition: ICondition = null;

    switch (type) {
      case ConditionElement.Single:
        condition = this.defaultCondition();
        break;

      case ConditionElement.Group:
        condition = this.addConditionGroup();
        break;

      default: break;
    }
    this.condition.conditions.push(condition)

    //Fixme: set conditions again to awake proxy
    this.condition.conditions = this.condition.conditions.slice();
    this.conditionUpdated();
  }

  private addConditionGroup(): ICondition {
    const newCondition: ConditionGroup = {
      id: generateId(),
      elementType: ConditionElement.Group,
      logicalOperator: ConditionLogicalOperator.All,
      conditions: [this.defaultCondition()],
      name: "",
    };
    return newCondition;
  }

  private defaultCondition(): ICondition {
    return getDefaultCondition();
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.group {
  padding: 20px;
  border: dotted 1px rgb(75, 75, 75);
  border-radius: 16px;
  margin-top: 25px;

  &.isRoot {
    border: none;
    padding: 0px;
    margin-top: 30px;
    padding-left: 10px;
  }

  .header {

    border-radius: 8px;
    position: relative;
    top: -40px;
    left: -11px;


    display: flex;
    gap: 5px;
    align-items: baseline;

    .actions {
      margin-left: auto;
      margin-right: 2px;
      display: flex;
      gap: 10px;

      .toggle-visibility,
      .delete {
        position: relative;
        top: 8px;
      }

      .toggle-visibility {
        padding-left: 5px;
        padding-right: 5px;
      }

      .delete {
        background-color: var(--c-base);
      }


    }
  }

  .buttons-container {
    margin-top: 5px;
    display: flex;
    gap: 10px;
    margin-left: 10px;

    .delete {
      margin-left: auto;
    }

    margin-bottom:10px;
  }
}
</style>
