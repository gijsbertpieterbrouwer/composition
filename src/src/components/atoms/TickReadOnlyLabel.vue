<template>
  <span class="tick-label" :class="[this.colorName]">
    <slot />
  </span>
</template>

<script lang="ts">
import { ColorsEnum } from "@/TickApi";
import { getColorName } from "@/helpers/colorsHelper";
import { Component, Vue } from "vue-facing-decorator";



@Component({
  emits: ["remove"],
})
export default class TickReadOnlyLabel extends Vue {
  private get colorName() {
    return getColorName(ColorsEnum.BoldYellow);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.tick-label {
  @include neon-bg;
  @include font-inter;


  padding: 0 4px;


  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  text-transform: capitalize;
  white-space: nowrap;

  border-radius: 2px;
  transition: all 0.3s ease;
  color: $white;
  display: inline-block;
  max-width: 200px;
  min-width: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 8 12px;
}
</style>
