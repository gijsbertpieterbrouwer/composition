<template>
  <div class="condition">
    <TickInput v-model="name" :placeholder="$translate(LanguagePath.App_ChartingEditor_HeatmapApperanceRule_Name)" />
    <TickInput type="number" v-model="fromValue" :placeholder="$translate(LanguagePath.App_ChartingEditor_HeatmapApperanceRule_From)" />
    <TickInput type="number" v-model="toValue" :placeholder="$translate(LanguagePath.App_ChartingEditor_HeatmapApperanceRule_To)" />
    <TickColorSelector v-model="color" :allowAsSubDialog="true" />
    <TickButton class="remove" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
  </div>
</template>

<script lang="ts">
import { Component, VModel, Vue } from 'vue-facing-decorator';
import { ColorsEnum, RangeAppearanceCondition, LanguagePath } from "@/TickApi";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickColorSelector from "@/components/molecules/Selectors/TickColorSelector.vue";

@Component({
  emits: ["update:modelValue", "remove"],
  components: { TickInput, TickSelector, TickEditorPanel, TickButton, TickSwitch, TickColorSelector }
})
export default class DashboardHeatmapTileAppearanceRuleEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  LanguagePath = LanguagePath;
  @VModel({ required: true }) private model!: Required<RangeAppearanceCondition>;

  private remove() {
    this.$emit("remove");
    return false;
  }

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }


  private get color() {
    return this.model?.color;
  }

  private set color(to: ColorsEnum) {
    this.model.color = to ?? ColorsEnum.Grey;
    this.pushUpdate();
  }


  private get fromValue() {
    return this.model?.fromValue;
  }

  private set fromValue(to: number) {
    this.model.fromValue = to;
    this.pushUpdate();
  }

  private get toValue() {
    return this.model?.toValue;
  }

  private set toValue(to: number) {
    this.model.toValue = to;
    this.pushUpdate();
  }

  private get name() {
    return this.model?.name;
  }

  private set name(to: string) {
    this.model.name = to;
    this.pushUpdate();
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
