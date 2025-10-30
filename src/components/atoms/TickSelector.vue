<template>
  <TickInputLabel>
    <slot />
    <select class="selector" v-model="model" :disabled="disabled" :class="[this.colorName]">
      <option v-for="opt in this.sortedOptions" :key="opt.value" :value="opt.value">
        {{ opt.text }}
      </option>
    </select>
  </TickInputLabel>
</template>

<script lang="ts">
import { ColorsEnum } from '@/TickApi';
import { getColorName } from '@/helpers/colorsHelper';
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
//import TickInputLabel from './TickInputLabel.vue';
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";

export interface Option {
  text: string;
  value: string | number;
}

@Component({
  components: [TickInputLabel],
  emits: ["update:modelValue", "select"],
})
export default class TickSelector extends Vue {
  @VModel({ required: true }) private value!: string;
  @Prop({ required: true }) private options!: Option[];
  // @Prop({ default: "" }) private placeholder!: string;
  @Prop({ default: false }) private disabled!: boolean;
  @Prop({ default: true }) private sort!: boolean;
  @Prop({ default: null }) private color!: ColorsEnum;

  private get model() {
    return this.value;
  }

  private set model(to: string) {
    this.$emit("update:modelValue", to);
  }

  private get colorName() {
    return getColorName(this.color);
  }

  private get sortedOptions() {
    if (!this.sort || !this.options || !this.options.length) { return this.options || []; }

    const list = this.options.sort((a, b) => a.text.localeCompare(b.text));
    return list;
  }


}
</script>
<style lang="scss">
@import "@/styles/theme";


.selector {
  &:not(:focus) {
    @include neon-bg;
  }


  border: none;
  background-color: var(--c-base-300);
  color: var(--c-contrast);
  display: block;
  height: 32px;
  border-radius: 2px;

  //font-size: $text-size-regular;
  line-height: 16px;
  width: 100%;

  padding: 0 4px;

  * {
    border-radius: 0px;
  }

  &:not([disabled]):focus {
    border-color: $grey900;
  }

  &[disabled] {
    border-color: $grey200;
    opacity: 0.5;
  }


  &:not([disabled]):focus {
    border-color: $grey900;
  }

  &[disabled] {
    border-color: $grey200;
  }
}
</style>