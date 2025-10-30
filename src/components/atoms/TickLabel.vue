<template>
  <span class="tick-label" :class="[{ collapsed: this.collapsed }, this.colorName, this.getSizeClass]" :data-name="name" @click="toggle" :title="collapsed ? this.normalizedName : undefined">
    <TickIcon :name="icon" v-if="icon" />
    {{ this.normalizedName }}
    <button @click.stop="remove" v-if="allowRemove">x</button>
  </span>
</template>

<script lang="ts">
import { getColorName } from "@/helpers/colorsHelper";
import { translate } from "@/plugins/translatePlugin";
import useViewstateStore, { InterfaceStateType } from "@/store/viewstate";
import { ColorsEnum, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "../TickIcon.vue";

export enum Size {
  regular = "regular",
  large = "large",
}

@Component({
  emits: ["remove"],
  components: { TickIcon }
})
export default class Ticklabel extends Vue {
  @Prop({ required: true }) private color!: ColorsEnum;
  @Prop({ required: true }) private name!: string;
  @Prop({ default: false }) private allowRemove: boolean;
  @Prop({ default: false }) private disableCollapse: boolean;
  @Prop({ default: false }) private disableToggle: boolean;
  @Prop({ default: Size.regular }) private size: Size;
  @Prop() private icon: string;

  private get getSizeClass(): string {
    const s = this.size || Size.regular;
    return `size-${s}`;
  }

  private get colorName() {
    return getColorName(this.color);
  }

  private get collapsed() {
    if (this.disableCollapse) {
      return false;
    }
    return useViewstateStore().has(InterfaceStateType.LabelsCollapsed);
  }

  private get normalizedName() {
    return (this.name || translate(LanguagePath.Label)).toLowerCase().trim();
  }

  private toggle() {
    if (this.disableCollapse || this.disableToggle) {
      return;
    }
    useViewstateStore().toggle(InterfaceStateType.LabelsCollapsed);
  }

  private remove() {
    this.$emit("remove");
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

  &.collapsed {
    overflow: hidden;
    color: transparent !important; // overwrite theme color
    width: 32px;
    line-height: 8px;
  }


  // &.size-regular {
  //   //padding: 2px 4px;
  // }

  &.size-large {
    font-size: 14px;
    min-width: 48px;
    border-radius: 4px;
    line-height: 32px;
    font-weight: 500;
    padding: 0 10px;
  }



}
</style>
