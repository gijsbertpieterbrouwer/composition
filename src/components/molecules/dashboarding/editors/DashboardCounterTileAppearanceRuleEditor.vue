<template>
  <div class="condition">
    <span class="text">{{ $translate(LanguagePath.App_ChartingEditor_AppearanceRuleEditor_IfValueIs) }}</span>
    <TickSelector v-model="operator" :options="operatorOptions" />
    <TickInput type="number" v-model="validationValue" />
    <span class="text">{{ $translate(LanguagePath.App_ChartingEditor_AppearanceRuleEditor_Consequence) }}</span>
    <!-- <TickSelector v-model="color" :options="colorOptions" /> -->
    <TickColorSelector v-model="color" :allowAsSubDialog="true" />

    <TickButton class="remove" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />

  </div>
</template>

<script lang="ts">
import { Component, VModel, Vue } from 'vue-facing-decorator';
import { AppearanceCondition, AppearanceConditionOperatorEnum, ColorsEnum, LanguagePath } from "@/TickApi";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import { getColorOptions, getTileAppearanceOperatorOptions } from '@/helpers/enumsHelper';
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';

import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickColorSelector from "@/components/molecules/Selectors/TickColorSelector.vue";

@Component({
  emits: ["update:modelValue", "remove"],
  components: { TickInput, TickSelector, TickEditorPanel, TickButton, TickSwitch, TickColorSelector }
})
export default class DashboardCounterTileAppearanceRuleEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  LanguagePath = LanguagePath
  @VModel({ required: true }) private model!: Required<AppearanceCondition>;

  private remove() {
    this.$emit("remove");
    return false;
  }

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }

  private get validationValue() {
    return this.model?.validationValue;
  }

  private set validationValue(to: number) {
    this.model.validationValue = to;
    this.pushUpdate();
  }

  private get color() {
    return this.model?.color;
  }

  private set color(to: ColorsEnum) {
    this.model.color = to ?? ColorsEnum.Grey;
    this.pushUpdate();
  }


  private get operator() {
    return this.model?.operator;
  }

  private set operator(to: AppearanceConditionOperatorEnum) {
    this.model.operator = to;
    this.pushUpdate();
  }


  private get colorOptions() {
    return getColorOptions()
  }

  private get operatorOptions() {
    return getTileAppearanceOperatorOptions()
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.condition {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 30px;
  width: 100%;

  .baseline {
    //display: inline-block;
    //justify-content: baseline;
  }

  .remove {
    justify-content: flex-end;
    margin-left: auto;
  }

  .text {
    opacity: 0.7;
  }

}
</style>
