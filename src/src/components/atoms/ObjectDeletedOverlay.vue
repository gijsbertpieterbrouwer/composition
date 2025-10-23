<template>
  <div class="overlay">

  </div>
  <div class="overlay-content">
    <slot />
  </div>

</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';

@Component
export default class ObjectDeletedOverlay extends Vue { }
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.overlay {
  position: absolute;
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.7);
  width: 100vw;
  height: 100dvh;
}

.overlay-content {
  align-content: center;
  position: absolute;
  z-index: 999999;
  display: flex;
  flex-wrap: wrap;
  width: 100vw;
  height: 100%;
  justify-content: center;


}
</style>
