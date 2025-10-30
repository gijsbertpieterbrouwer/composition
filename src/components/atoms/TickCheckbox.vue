<template>
  <TickInputLabel class="label">
    <input type="checkbox" v-model="value" :disabled="disabled" />
    <slot />
  </TickInputLabel>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
import TickInputLabel from './TickInputLabel.vue';

@Component({
  emits: ["update:modelValue"],
  components: [TickInputLabel]
})
export default class TickCheckbox extends Vue {
  @VModel() private value!: boolean;
  @Prop({ default: false }) private disabled!: boolean;
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.label {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
