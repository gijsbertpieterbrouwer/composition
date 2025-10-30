<template>
  <TickInputLabel>
    <slot />
    <template v-if="isColor">
      <div class="color-wrapper">
        <input class="color-input" :type="type" :min="min" :max="max" v-model="model" :disabled="disabled" :placeholder="placeholder" autocomplete="off" :maxlength="maxlength"
          @keyup="$emit('keyup', $event)" />
        <input v-if="isColor && !this.hideInput" type="string" v-model="model" :disabled="disabled" :placeholder="placeholder" autocomplete="off" @keyup="$emit('keyup', $event)" />
      </div>
    </template>
    <template v-else>

      <input :type="type" :min="min" :max="max" v-model="model" :disabled="disabled" :placeholder="placeholder" autocomplete="off" :maxlength="maxlength" @keyup="$emit('keyup', $event)" />

      <input v-if="isSlider && !this.hideInput" type="number" :min="min" :max="max" v-model="model" :disabled="disabled" :placeholder="placeholder" autocomplete="off" :maxlength="maxlength"
        @keyup="$emit('keyup', $event)" />
    </template>

    <div class="warning" v-if="invalidMessage">{{ this.invalidMessage }}</div>
  </TickInputLabel>
</template>

<script lang="ts">
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import { stringToNumber } from "@/helpers/stringHelper";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";

@Component({
  emits: ["update:modelValue", "submit", "keyup"],
  components: [TickInputLabel]
})
export default class TickInput extends Vue {
  @VModel({ required: true }) private value!: string;

  @Prop({ default: "" }) private placeholder!: string;
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ default: false }) private hideInput: boolean;
  @Prop({ default: "" }) private maxlength!: number;
  @Prop({ default: "text" }) private type!: string;
  @Prop({ default: null }) private min!: number;
  @Prop({ default: null }) private max!: number;
  @Prop({ default: "" }) private invalidMessage!: string;

  private get model() {
    return this.value;
  }

  private set model(to: string) {
    if (this.type == 'number') {
      const num = stringToNumber(to);
      if (this.min && num < this.min) {
        to = this.min.toString();
      }

      if (this.max && num > this.max) {
        to = this.max.toString();
      }
    }

    this.$emit("update:modelValue", to);
  }

  private get isSlider() {
    return this.type == 'range';
  }
  private get isColor() {
    return this.type == 'color';
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.warning {
  color: $error;
  font-style: italic;
}

.color-wrapper {
  display: flex;
  gap: 5px;

  .color-input {
    width: 70px;
  }

}

input {
  background-color: var(--c-base-300);
  color: var(--c-contrast);
  display: block;
  height: 32px;
  border-radius: 2px;
  padding: 8px;
  font-size: $text-size-regular;
  line-height: 16px;
  width: 100%;

  &:not([disabled]):focus {
    border-color: $grey900;
  }

  &[disabled] {
    border-color: $grey200;
    opacity: 0.5;
  }
}
</style>
