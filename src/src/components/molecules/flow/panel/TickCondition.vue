<template>
  <div class="condition">
    <TickConditionLogicalOperatorIndicator :isFirst="isFirst" :data="groupLogicalOperator" />


    <!-- <TickSelector class="selector" v-model="referenceInputLocation" :options="storageLocationOptions" :disabled="disabled" />
    <span>{{ this.getReferenceInputName }}</span>
    <TickInput v-model="condition.referenceInput" class="directValue" :disabled="disabled" /> -->


    <DatabagItemSelector class="reference" v-if="!disableInputSource" v-model="condition.referenceInput" :allowCustomValue="true" :allowAsSubDialog="true" :locations="availableStorageLocations"
      :disabled="disabled" :defaultNewStorageLocation="StorageLocation.Flow" />
    <span class="reference">{{ this.disabledInputSourceText }}</span>

    <TickSelector class="condition-operator" :color="conditionOperatorColor" v-model="condition.conditionOperator" :options="conditionOperatorOptions" :disabled="disabled" />
    <TickSelector class="selector" v-model="condition.conditionType" :options="conditionTypeOptions" :disabled="disabled" />


    <!-- <TickSelector class="selector" v-model="referenceValueLocation" :options="storageLocationOptions" :disabled="disabled" />
    <span>{{ this.getReferenceValueName }}</span>
    <TickInput v-model="condition.referenceValue" class="directValue" :disabled="disabled" />
 -->

    <DatabagItemSelector class="reference" v-model="condition.referenceValue" :allowCustomValue="true" :allowAsSubDialog="true" :locations="availableStorageLocations" :disabled="disabled"
      :defaultNewStorageLocation="StorageLocation.Flow" />

    <TickButton class="delete-button" :title="$translate(LanguagePath.App_Remove)" v-if="!disabled" @click="remove" icon="delete" :color="Color.contrast" :size="Size.regular"
      :appearance="Appearance.secondary" />

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import { ColorsEnum, Condition, ConditionLogicalOperator, ConditionOperator, LanguagePath, StorageLocation } from "@/TickApi";
import { getConditionOperatorOptions, getConditionTypeOptions } from '@/helpers/flowhelpers';
import TickInput from '../../../atoms/TickInput.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import { getStorageLocationOptions } from '@/helpers/enumsHelper';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickConditionLogicalOperatorIndicator from './TickConditionLogicalOperatorIndicator.vue';
import DatabagItemSelector from '../../Selectors/DatabagItemSelector.vue';

@Component({
  emits: ["patch", "remove"],
  components: { TickInput, TickButton, TickSelector, TickConditionLogicalOperatorIndicator, DatabagItemSelector },
  name: "TickCondition",
})
export default class TickCondition extends Vue {
  Color = Color
  Size = Size
  Appearance = Appearance
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @Prop() private condition!: Condition;
  @Prop() private disabled!: boolean;
  @Prop() private groupLogicalOperator!: ConditionLogicalOperator;
  @Prop() private isFirst!: boolean;
  @Prop() private disableInputSource!: boolean;
  @Prop() private disabledInputSourceText!: string;

  @Watch("condition", {
    deep: true,
  })
  private onUpdate() {
    this.$emit("patch", this.condition);
  }

  private remove() {
    this.$emit("remove", this.condition);
  }

  private get availableStorageLocations(): StorageLocation[] {
    return this.storageLocationOptions.map((d) => d.value);
  }
  private get storageLocationOptions() {
    return getStorageLocationOptions(true, false);
  }
  private get conditionOperatorColor() {

    switch (this.condition.conditionOperator) {
      case ConditionOperator.Does: return ColorsEnum.Green;
      case ConditionOperator.DoesNot: return ColorsEnum.Purple;
      default: return ColorsEnum.Grey;
    }
  }


  // private get referenceInputLocation() {
  //   return this.condition.referenceInputLocation;
  // }
  // private set referenceInputLocation(to: StorageLocation) {
  //   this.condition.referenceInputLocation = to;
  // }

  private get referenceInput() {
    return this.condition.referenceInput
  }
  private set referenceInput(to: string) {
    this.condition.referenceInput = to;
  }

  // private get referenceValueLocation() {
  //   return this.condition.referenceValueLocation;
  // }
  // private set referenceValueLocation(to: StorageLocation) {
  //   this.condition.referenceValueLocation = to;
  // }
  private get referenceValue() {
    return this.condition.referenceValue
  }
  private set referenceValue(to: string) {
    this.condition.referenceValue = to;
  }



  private get conditionOperatorOptions() {
    return getConditionOperatorOptions();
  }
  private get conditionTypeOptions() {
    return getConditionTypeOptions();
  }

  // private get getReferenceInputName() {
  //   return this.condition.referenceInputLocation == null ? " " : "."
  // }

  // private get getReferenceValueName() {
  //   return this.condition.referenceValueLocation == null ? " " : "."
  // }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.condition {

  display: flex;
  gap: 20px;
  align-items: center;
  padding: 0;
  background-color: var(--c-base-100);
  margin-bottom: 2px;
  width: 900px;
  height: 45px;
  padding-left: 10px;


  .selector {
    width: auto;
    display: inline-block;
    //border-radius: 8px;
  }

  .reference {
    flex-grow: 1;
    font-size: $text-size-regular;
  }

  .delete-button {
    margin-left: auto;
    margin-right: 10px;
  }


}
</style>
