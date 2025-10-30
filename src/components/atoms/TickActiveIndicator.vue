<template>
  <span><span class="active-indicator" :class="colorName"> {{ normalizedText }}</span></span>
</template>

<script lang="ts">
import { getColorName } from "@/helpers/colorsHelper";
import { translate } from "@/plugins/translatePlugin";
import { ColorsEnum, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "../TickIcon.vue";

export enum ActiveStatusEnum {
  active,
  partialActive,
  inactive
}

@Component({
  emits: ["remove"],
  components: { TickIcon }
})
export default class TickActiveIndicator extends Vue {
  @Prop({ required: true }) private status!: ActiveStatusEnum;
  @Prop({ required: false }) private text: string;

  private get normalizedText(): string {
    if (this.text) { return this.text; }

    switch (this.status) {
      case ActiveStatusEnum.active: return translate(LanguagePath.App_ActiveStatusEnum_Active);
      case ActiveStatusEnum.partialActive: return translate(LanguagePath.App_ActiveStatusEnum_PartialActive);
      case ActiveStatusEnum.inactive:
      default:
        return translate(LanguagePath.App_ActiveStatusEnum_InActive);
    }
  }

  private get colorName() {
    if (this.status == ActiveStatusEnum.active) {
      return getColorName(ColorsEnum.Lime);
    }

    if (this.status == ActiveStatusEnum.partialActive) {
      return getColorName(ColorsEnum.Orange);
    }

    if (this.status == ActiveStatusEnum.inactive) {
      return getColorName(ColorsEnum.Sky);
    }

    return getColorName(ColorsEnum.Grey);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.active-indicator {
  @include neon-bg;
  display: inline-flex;
  padding: 2px;
  background-color: $grey400;
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: #fff;

}
</style>
