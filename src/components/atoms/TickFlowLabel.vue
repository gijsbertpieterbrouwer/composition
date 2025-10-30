<template>
  <span class="tick-label" :class="[this.colorName]">
    {{ this.flowName }}
  </span>
</template>

<script lang="ts">
import { getColorName } from "@/helpers/colorsHelper";
import useUtilityDataStore from "@/store/utilitydata";
import { ColorsEnum } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "../TickIcon.vue";



@Component({
  emits: ["remove"],
  components: { TickIcon }
})
export default class TickFlowLabel extends Vue {
  @Prop({ default: "" }) private id!: string;

  private get flowName() {
    if (!this.id) { return ""; }
    const flow = useUtilityDataStore().flow(this.id);
    return flow?.name;
  }
  private get colorName() {
    return getColorName(ColorsEnum.Yellow);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.tick-label {
  @include neon-bg;
  @include font-inter;


  padding: 8px 30px;


  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  text-transform: capitalize;
  white-space: nowrap;

  border-radius: 20px;
  transition: all 0.3s ease;
  color: $white;
  display: inline-flex;
  gap: 10px;
  max-width: 200px;
  min-width: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 8 12px;
}
</style>
