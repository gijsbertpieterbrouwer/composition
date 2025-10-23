<template>
  <TickInputLabel>
    <slot />
    <textarea v-model="model" :data-rows="minimumrows" rows="2" v-autogrow :disabled="disabled" :maxlength="maxlength" :placeholder="placeholder" />
  </TickInputLabel>
</template>

<script lang="ts">
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import { autogrow } from "@/directives";
import { Component, Model, Prop, Vue } from "vue-facing-decorator";


@Component({
  emits: ["update:modelValue"],
  directives: { autogrow },
  components: [TickInputLabel]
})
export default class TickTextarea extends Vue {
  @Model({ required: true }) private value!: string;
  @Prop() private disabled!: boolean;
  @Prop({ default: 1 }) private minimumrows: number;
  @Prop({ default: "" }) private maxlength!: number;
  @Prop({ default: "" }) private placeholder!: string;

  private get model() {
    return this.value;
  }

  private set model(to) {
    this.$emit("update:modelValue", to);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

textarea {
  padding: 4px 4px 0 4px;
  border-radius: 4px;
  font-size: $text-size-regular;
  line-height: 16px;
  height: auto;
  //border: solid 1px #efefef;
  display: block;
  width: 100%;
  padding: 8px;
  overflow-wrap: anywhere;
  background-color: var(--c-base-300);
  color: var(--c-contrast);

  &[disabled] {
    border-color: $grey200;
    opacity: 0.5;
  }
}
</style>
