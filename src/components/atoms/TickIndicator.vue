<template>
  <span class="indicator" v-if="indicatorTitle" :class="indicatorColor" :title="indicatorTooltip">{{ this.indicatorTitle }}</span>
</template>

<script lang="ts">
import { getColorName } from "@/helpers/colorsHelper";
import { numberToString } from "@/helpers/stringHelper";
import { ColorsEnum } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
export interface TickIndicatorData {
  title: string | number;
  tooltip?: string,
  color: ColorsEnum;
}

@Component({
  components: {},
})
export default class TickIndicator extends Vue {
  @Prop() private indicator?: TickIndicatorData;

  private get indicatorTitle() {
    //return numberToString(10000);
    let title = this.indicator ? this.indicator.title : "";
    if (typeof (title) == 'number') {
      title = numberToString(title);
    }

    return title;
  }
  private get indicatorTooltip() {
    return this.indicator ? this.indicator.tooltip : "";
  }

  private get indicatorColor() {
    return this.indicator.color && (this.indicator.color as unknown != ColorsEnum.Grey) ? getColorName(this.indicator.color) : null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.indicator {
  position: absolute;
  left: 15px;
  top: -8px;
  border-radius: 100px;
  padding: 0px 8px;
  color: var(--c-contrast);

  background-color: var(--c-base);
  color: var(--c-contrast);
  flex-shrink: 0;
  font-size: 0.7em;

  justify-content: center;
  align-content: center;



  @include neon-bg;
}
</style>
