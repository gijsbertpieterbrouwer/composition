<template>
  <label class="label">
    <slot />
  </label>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";

@Component({

})
export default class TickInputLabel extends Vue {
  // @Prop({ default: false }) private disabled: boolean;

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.label {
  line-height: 20px;
  font-size: $text-size-regular;
  padding: 2px 0;
  color: $grey700;
  display: grid;
  gap: 5px;
}
</style>
