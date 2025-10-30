<template>
  <div class="composer">
    <div class="mathFunction">
      <DatabagItemSelector v-model="reference1" :allowCustomValue="true" :allowAsSubDialog="true" />
      <TickSelector class="operator" v-model="operator" :options="operatorOptions" />
      <DatabagItemSelector v-model="reference2" :allowCustomValue="true" :allowAsSubDialog="true" />
    </div>
    <!-- <TickButton @click="confirm" :size="Size.regular" :color="Color.primary" :appearance="Appearance.primary">Use</TickButton> -->
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import { getMathTokenFunctionsOptions } from '@/helpers/enumsHelper';
import { Component, Vue, Watch } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import DatabagItemSelector from '../Selectors/DatabagItemSelector.vue';

@Component({
  emits: ["change"],
  components: { TickEditorPanel, DatabagItemSelector, TickButton, TickSelector },
})
export default class TokenMathFunctionEditor extends Vue {
  Size = Size;
  Color = Color;
  Appearance = Appearance;

  private reference1 = "";
  private reference2 = "";
  private operator = "add";

  private get operatorOptions() {
    return getMathTokenFunctionsOptions();
  }

  private change() {
    this.$emit("change", this.functionAsToken);
  }

  private get functionAsToken(): string {
    //example {{math(flow.numericalanswer1).add(2)}} => braces must not be included
    return `math(${this.reference1}).${this.operator}(${this.reference2})`;
  }

  @Watch("functionAsToken")
  private onTokenChanged() {
    this.change();
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.composer {
  display: grid;
  gap: 10px;

  .mathFunction {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .operator {
    min-width: 100px;
  }
}
</style>
