<template>
  <div class="properties" v-if="step">
    <div class="item-actions">
      <input type="text" class="name" v-model="stepName" :disabled="disabled" :placeholder="$translate(LanguagePath.App_Name)" />
      <TickButton icon="delete" :disabled="disabled" @click="remove" :appearance="Appearance.secondary" :color="Color.contrast" />
    </div>
    <div class="settings">
      <TickColorSelector class="color-selector" v-model="stepColor">{{ $translate(LanguagePath.Color) }}</TickColorSelector>
    </div>
    <DocuHolder class="docuHolder" :group="docuBlocks" />
    <TickRtcIndicator />
  </div>
</template>

<script lang="ts">
import { ColorsEnum, DocumentationGroup, FlowStep, LanguagePath } from "@/TickApi";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickRtcIndicator from '@/components/atoms/TickRtcIndicator.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickColorSelector from "@/components/molecules/Selectors/TickColorSelector.vue";
import { onConfirmation } from '@/helpers/questionHelper';
import FlowRtcHub from "@/services/rtc/FlowRtcHub";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import DocuHolder from '../../docublocks/DocuHolder.vue';

@Component({
  emits: ["onColorChange", "onNameChange"],
  components: {
    TickButton,
    TickRtcIndicator,
    TickSelector,
    DocuHolder,
    TickColorSelector
  }
})
export default class StepProperties extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size;
  LanguagePath = LanguagePath

  @Prop() private step!: FlowStep;
  @Prop() private flowId!: string;
  @Prop() private flowVersionId!: string;
  @Prop() private disabled!: boolean;

  private get docuBlocks(): DocumentationGroup[] {
    const r: DocumentationGroup[] = []
    r.push(DocumentationGroup.FlowEditorStep)
    return r;
  }

  private get stepName() {
    return this.step.name;
  }
  private set stepName(to: string) {
    this.$emit("onNameChange", to);
  }

  private get stepColor() {
    return this.step.color;
  }

  private set stepColor(to: ColorsEnum) {
    this.$emit("onColorChange", to);
  }


  private remove() {
    onConfirmation(() => {

      FlowRtcHub.deleteStep({
        flowVersionId: this.flowVersionId,
        stepId: this.step.id,
      });
    });

  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";



.properties {
  //font-size: $text-size-regular;

  .item-actions {
    display: flex;
    flex-wrap: wrap;

    .name {
      flex-grow: 1;
      cursor: text;
      font-size: 25px;
      display: inline-flex;
      @include font-outfit;
      font-weight: 600;
      width: 60%;
    }

  }

  .settings {
    margin-top: 50px;
    display: grid;
    gap: 5px;
  }

  .docuHolder {
    height: auto;
    margin-top: 100px;
  }
}
</style>